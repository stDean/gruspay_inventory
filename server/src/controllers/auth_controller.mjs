import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { my_plans } from "../utils/constants.mjs";
import { prisma } from "../utils/db.mjs";
import { comparePassword, createJWT, hashPassword } from "../utils/helper.mjs";
import { JobLogger } from "../utils/JobLogger.mjs";
import { otpHtml, sendNodeMail } from "../utils/sendMail.mjs";
import { generateVerificationToken } from "../utils/token.mjs";
import {
	cancelSubscription,
	createSubscription,
	getCustomer,
	getCustomerSubscriptions,
	initializeSubscription,
	reactivateSubscription,
	refundInitialFee,
} from "./paystack.c.mjs";

// #region Helper Functions
// Function to send OTP email
const sendOtpEmail = async (to, token) => {
	const htmlContent = otpHtml(token);
	await sendNodeMail(to, "Your OTP Code", "", htmlContent);
};

const handleOtpForCompany = async email => {
	const { token, expires } = await generateVerificationToken(email);
	const existingOtp = await prisma.otp.findFirst({ where: { email } });

	if (existingOtp) {
		await prisma.otp.update({
			where: { id: existingOtp.id },
			data: { otp: token, expiresAt: expires },
		});
	} else {
		await prisma.otp.create({
			data: { email, otp: token, expiresAt: expires },
		});
	}

	sendOtpEmail(email, token);
};

/**
 * Stores subscription updates in DB and schedules background job
 * Ensures job persistence across server restarts
 */
const scheduleSubscriptionUpdate = async (
	companyId,
	paymentPlan,
	billingType,
	nextBillingDate
) => {
	JobLogger.record("SUBSCRIPTION_UPDATE", companyId, executeAt);
	// Store update metadata in database
	await prisma.company.update({
		where: { id: companyId },
		data: {
			pendingPlanUpdate: `${paymentPlan}_${billingType}`,
			nextBillingDate,
			canUpdate: false,
			cancelable: false,
		},
	});
};
//#endregion

// Reusable function to get customer and active subscription
const getCustomerAndSubscription = async email => {
	try {
		const { error: customerError, theCustomer } = await getCustomer({ email });

		if (customerError) {
			return { error: customerError };
		}

		const { error, subscriptions } = await getCustomerSubscriptions(
			theCustomer.id
		);

		if (error || !subscriptions.length) {
			return { error: error || "No active subscription found" };
		}

		const sub = subscriptions[0];
		const nextBillingDate = new Date(sub.next_payment_date);

		let cronTime = `${nextBillingDate.getMinutes()} ${nextBillingDate.getHours()} ${nextBillingDate.getDate()} ${
			nextBillingDate.getMonth() + 1
		} *`;

		return { sub, nextBillingDate, cronTime, theCustomer };
	} catch (error) {
		console.error("Error retrieving customer and subscription:", error);
		return { error: "Internal server error" };
	}
};

// Reusable function to cancel an existing subscription
const cancelCustomerSubscription = async sub => {
	try {
		const { error: cancelErr } = await cancelSubscription({
			code: sub.subscription_code,
			token: sub.email_token,
		});
		return cancelErr ? { error: cancelErr } : { success: true };
	} catch (error) {
		console.error("Error cancelling subscription:", error);
		return { error: "Failed to cancel subscription" };
	}
};

export const AuthController = {
	// create account
	createCompany: async (req, res) => {
		try {
			const {
				company_name,
				company_email,
				password,
				country,
				billingPlan,
				billingType,
			} = req.body;

			// Ensure all required fields are present
			if (!company_email || !company_name || !password || !country) {
				return res
					.status(StatusCodes.BAD_REQUEST)
					.json({ msg: "All fields are required", success: false });
			}

			const existingCompany = await prisma.company.findUnique({
				where: { company_email },
			});

			// Check if the company already exists
			if (existingCompany) {
				if (
					!existingCompany.verified &&
					existingCompany.paymentStatus === "ACTIVE"
				) {
					await handleOtpForCompany(existingCompany.company_email);

					return res.status(StatusCodes.OK).json({
						message: "Check your email for OTP",
						success: true,
					});
				}

				if (
					existingCompany.verified &&
					existingCompany.paymentStatus === "INACTIVE"
				) {
					return res
						.status(StatusCodes.BAD_REQUEST)
						.json({ msg: "Company already exists." });
				}

				await prisma.company.delete({ where: { id: existingCompany.id } });
			}

			// Initialize the company as a customer
			const { transaction, error, verify } = await initializeSubscription({
				email: company_email,
				amount: "5000",
			});

			if (error || !transaction || !verify) {
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ msg: "Subscription initialization failed." });
			}

			// Create new company
			const hashedPassword = await hashPassword(password);
			const company = await prisma.company.create({
				data: {
					company_email,
					company_name,
					country,
					password: hashedPassword,
					paymentStatus: "INACTIVE",
					billingPlan: billingPlan.toUpperCase(),
					billingType:
						billingType.toLowerCase() === "year" ? "YEARLY" : "MONTHLY",
				},
			});

			// Send OTP for verification
			await handleOtpForCompany(company.company_email);

			return res.status(StatusCodes.OK).json({
				message: "Company created - check email for verification OTP",
				transaction,
			});
		} catch (error) {
			console.error("Company creation error:", error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				msg: "Internal server error",
			});
		}
	},
	verifyOtp: async (req, res) => {
		try {
			const { otp, company_email } = req.body;
			if (!otp) {
				return res
					.status(StatusCodes.BAD_REQUEST)
					.json({ msg: "OTP is required", success: false });
			}

			const existingOtp = await prisma.otp.findFirst({
				where: {
					email: company_email,
					otp,
					// Ensure OTP is not expired
					expiresAt: { gte: new Date() },
					verified: false,
				},
			});

			if (!existingOtp) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					msg: "Invalid or expired OTP",
				});
			}

			const company = await prisma.company.findUnique({
				where: { company_email },
				include: { payStackAuth: true },
			});

			const planName = `${company.billingPlan.toLowerCase()}_${company.billingType
				.replace("LY", "")
				.toLowerCase()}`;
			const startDate = new Date();
			startDate.setDate(startDate.getDate() + 7); // 7-day trial period

			const auth = await prisma.payStackAuth.findUnique({
				where: { id: company.payStackAuth.id },
			});

			if (!auth) {
				return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					msg: "Payment system initialization delay - please try again in 2 minutes",
				});
			}

			// create company subscription plan
			const { error: subscriptionError } = await createSubscription({
				customer: auth.customerCode,
				plan: my_plans[planName],
				start_date: startDate,
				authorization: auth.authorization_code,
			});

			if (subscriptionError) {
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ msg: "Subscription creation failed." });
			}

			// Mark OTP as verified
			await prisma.otp.update({
				where: { id: existingOtp.id },
				data: { verified: true },
			});

			// update company verified field
			await prisma.company.update({
				where: { company_email: existingOtp.email },
				data: { verified: true, expires: startDate },
			});

			// delete the otp
			await prisma.otp.delete({
				where: { id: existingOtp.id },
			});

			// refund initial fee
			const { error: resErr } = await refundInitialFee({
				transId: Number(company.payStackAuth.transactionId),
				amount: "5000",
			});

			if (resErr) {
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ msg: resErr });
			}

			// create user
			let user;
			if (company) {
				user = await prisma.users.create({
					data: {
						companyId: company.id,
						email: company.company_email,
						password: company.password,
						role: "ADMIN",
					},
				});
			}

			const jwtToken = createJWT({
				email: user.email,
				company_id: user.companyId,
			});

			res.status(StatusCodes.OK).json({
				message: "OTP verified",
				success: true,
				jwtToken,
				role: user.role,
			});
		} catch (error) {
			console.error("OTP verification error");
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				msg: "Internal server error",
			});
		}
	},
	resendOtp: async (req, res) => {
		if (!req.body.email) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Email is required", success: false });
		}

		const existingCompany = await prisma.company.findUnique({
			where: { company_email: req.body.email },
		});

		if (!existingCompany) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No company was found with that email" });
		}

		const existingToken = await prisma.otp.findFirst({
			where: { email: req.body.email },
		});

		const { token, expires } = await generateVerificationToken(
			existingToken.email
		);
		await prisma.otp.update({
			where: { id: existingToken.id },
			data: { otp: token, expiresAt: expires },
		});

		sendOtpEmail(existingToken.email, token);

		res
			.status(StatusCodes.OK)
			.json({ message: "OTP sent to your email", success: true });
	},
	login: async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "All fields are required", success: false });
		}

		const user = await prisma.users.findUnique({
			where: { email },
		});
		if (!user) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No user with this credentials", success: false });
		}
		const passwordMatch = await comparePassword(password, user.password);
		if (!passwordMatch) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Incorrect password!", success: false });
		}

		const jwtToken = createJWT({
			email: user.email,
			company_id: user.companyId,
		});

		res
			.status(StatusCodes.OK)
			.json({ success: true, jwtToken, role: user.role });
	},
	otp: async (req, res) => {
		const { email, password } = req.body;
		if (!email) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Email is required", success: false });
		}

		if (!password) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Password is required", success: false });
		}

		const existingToken = await prisma.otp.findFirst({
			where: { email },
		});

		const { token, expires } = await generateVerificationToken(email);
		if (existingToken) {
			await prisma.otp.update({
				where: { id: existingToken.id },
				data: { otp: token },
			});
		}

		await prisma.otp.create({
			data: { email, otp: token, expiresAt: expires },
		});
		sendOtpEmail(email, token);
		res
			.status(StatusCodes.OK)
			.json({ message: "OTP sent to your email", success: true, expires });
	},
	verifyAndUpdatePassword: async (req, res) => {
		const { email, otp, password } = req.body;

		const existingOtp = await prisma.otp.findFirst({
			where: { email, otp },
		});
		if (!existingOtp) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Invalid OTP", success: false });
		}
		const existingUser = await prisma.users.findUnique({
			where: { email },
		});
		if (!existingUser) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No user with this credentials", success: false });
		}

		const hashPass = await hashPassword(password);
		await prisma.users.update({
			where: { id: existingUser.id },
			data: { password: hashPass },
		});

		await prisma.otp.delete({
			where: { id: existingOtp.id },
		});

		res
			.status(StatusCodes.OK)
			.json({ message: "Password updated successfully", success: true });
	},
	updateSubscription: async (req, res) => {
		const { billingType, payment_plan } = req.body;
		const { email, company_id } = req.user;

		if (!billingType || !payment_plan) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				msg: "Billing type and payment plan are required",
				success: false,
			});
		}

		const { error: customerError, theCustomer } = await getCustomer({
			email,
		});

		if (customerError) {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: customerError });
		}

		const { error, subscriptions } = await getCustomerSubscriptions(
			theCustomer.id
		);
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: error });
		}

		// Calculate next billing date (UTC)
		const sub = subscriptions[0];
		const nextBillingDate = DateTime.fromISO(sub.next_payment_date)
			.toUTC()
			.toJSDate();

		if (sub.status === "active") {
			// Cancel the previous subscription
			const { error: cancelError } = await cancelCustomerSubscription(sub);
			if (cancelError)
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ msg: cancelError });
		}

		console.log({ nextBillingDate, a: new Date() });
		return;

		if (nextBillingDate === new Date()) {
			console.log("Subscription is due for renewal");
			return;
			const { transaction, error, verify } = await reactivateSubscription({
				email,
				amount: "500000",
				plan: my_plans[
					`${payment_plan.toLowerCase()}_${billingType.toLowerCase()}`
				],
			});

			if (error || !transaction || !verify) {
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ msg: error });
			}

			await prisma.company.update({
				where: { id: company_id },
				data: {
					cancelable: true,
					canUpdate: true,
					billingType: billingType === "year" ? "YEARLY" : "MONTHLY",
					billingPlan: payment_plan.toUpperCase(),
				},
			});

			return res
				.status(StatusCodes.OK)
				.json({ msg: "Subscription updated successfully", transaction });
		}

		// create a new subscription with a start date the date the previous one ends
		const planName = `${payment_plan.toLowerCase()}_${billingType}`;
		const { error: subscriptionError } = await createSubscription({
			customer: theCustomer.id,
			plan: my_plans[planName],
			start_date: nextBillingDate,
			authorization: sub.authorization.authorization_code,
		});

		if (subscriptionError) {
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: "Subscription creation failed." });
		}

		await prisma.company.update({
			where: { id: company_id },
			data: {
				pendingPlanUpdate: `${payment_plan}_${billingType}`,
				nextBillingDate,
				canUpdate: false,
				cancelable: false,
			},
		});

		// send a success message
		return res.status(StatusCodes.OK).json({
			msg: "Plan has been successfully changed.",
		});
	},
	cancelSubscription: async (req, res) => {
		try {
			const { email, company_id } = req.user;

			// get the current active subscriptions
			const { sub, cronTime, error } = await getCustomerAndSubscription(email);
			if (error) {
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ msg: error });
			}

			// cancel subscription
			const { error: cancelError } = await cancelCustomerSubscription(sub);
			if (cancelError)
				return res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ msg: cancelError });

			const deactivationDate = DateTime.fromISO(sub.next_payment_date)
				.plus({ minutes: 10 }) // Add 10 minutes
				.toUTC()
				.toJSDate();

			// make the cancel subscription be disabled
			await prisma.company.update({
				where: { id: company_id },
				data: {
					cancelable: false,
					canUpdate: false,
					expires: deactivationDate,
					scheduledDeactivation: deactivationDate,
				},
			});

			JobLogger.record("SUBSCRIPTION_CANCEL", company_id, deactivationDate);

			return res
				.status(StatusCodes.OK)
				.json({ msg: "Subscription cancelled successfully" });
		} catch (error) {
			console.error("Subscription cancellation error:", error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				msg: error.message || "Cancellation failed",
			});
		}
	},
	reactivateSubscription: async (req, res) => {
		const { email, company_id } = req.user;
		if (!company_id || !email) {
			return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Unauthorized" });
		}

		const { payment_plan, billingType, billingPrice } = req.body;
		if (!payment_plan || !billingType || !billingPrice) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Payment plan and billing type are required" });
		}

		// Initialize the company as a customer
		const { transaction, error, verify } = await reactivateSubscription({
			email,
			amount: billingPrice,
			plan: my_plans[
				`${payment_plan.toLowerCase()}_${billingType.toLowerCase()}`
			],
		});

		if (error || !transaction || !verify) {
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: "Error initializing subscription" });
		}

		await prisma.company.update({
			where: { id: company_id },
			data: {
				cancelable: true,
				canUpdate: true,
				billingType: billingType === "year" ? "YEARLY" : "MONTHLY",
				billingPlan: payment_plan.toUpperCase(),
			},
		});

		return res
			.status(StatusCodes.OK)
			.json({ msg: "Subscription reactivated successfully", transaction });
	},
};
