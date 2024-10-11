import cron from "node-cron";
import { prisma } from "../utils/db.mjs";
import { StatusCodes } from "http-status-codes";
import { generateVerificationToken } from "../utils/token.mjs";
import { hashPassword, comparePassword, createJWT } from "../utils/helper.mjs";
import { sendMail } from "../utils/sendMail.mjs";
import {
	createSubscription,
	initializeSubscription,
	getCustomer,
	cancelSubscription,
} from "./paystack.c.mjs";
import { my_plans } from "../constants.mjs";

const handleOtpForCompany = async email => {
	const { token, expires } = await generateVerificationToken(email);
	const existingOtp = await prisma.otp.findFirst({ where: { email } });

	if (existingOtp) {
		await prisma.otp.update({
			where: { email },
			data: { otp: token, expiresAt: expires },
		});
	} else {
		await prisma.otp.create({
			data: { email, otp: token, expiresAt: expires },
		});
	}

	sendMail(email, token, "OTP Verification");
};

// Function to update the billing plan
const updateBillingPlan = async (
	companyPaymentsId,
	billingType,
	payment_plan,
	company_id
) => {
	try {
		// enable the cancel button
		await prisma.company.update({
			where: { id: company_id },
			data: { cancelable: true },
		});

		// Update the plan on the next billing date
		await prisma.companyPayments.update({
			where: { id: companyPaymentsId },
			data: {
				billType: billingType === "year" ? "YEARLY" : "MONTHLY",
				plan: payment_plan.toUpperCase(),
			},
		});
		console.log("Billing plan updated successfully");
	} catch (error) {
		console.error("Error updating billing plan:", error);
	}
};

const deActivateAccount = async company_id => {
	try {
		const company = await prisma.company.findUnique({
			where: { id: company_id },
		});

		if (!company) {
			return { error: "Company not found" };
		}

		await prisma.company.update({
			where: { id: company_id },
			data: {
				paymentStatus: "INACTIVE",
				CompanyPayments: { disconnect: true },
			},
		});

		await prisma.companyPayments.delete({
			where: { id: company.companyPaymentsId },
		});

		console.log("Account deactivated successfully");
	} catch (e) {
		console.error("Error canceling billing plan:", error);
	}
};

// Reusable function to get customer and active subscription
const getCustomerAndSubscription = async email => {
	try {
		const {
			error: customerError,
			subscriptions,
			theCustomer,
			authorization,
		} = await getCustomer({ email });

		if (customerError || !subscriptions.length) {
			return { error: customerError || "No active subscription found" };
		}

		const sub = subscriptions[0];
		const nextBillingDate = new Date(sub.next_payment_date);
		const cronTime = `${nextBillingDate.getMinutes()} ${nextBillingDate.getHours()} ${nextBillingDate.getDate()} ${
			nextBillingDate.getMonth() + 1
		} ${nextBillingDate.getDay()}`;

		return { sub, nextBillingDate, cronTime, theCustomer, authorization };
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
		const {
			company_name,
			company_email,
			password,
			country,
			billingType,
			payment_plan,
		} = req.body;

		// Ensure all required fields are present
		if (!company_email || !company_name || !password || !country) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "All fields are required", success: false });
		}

		// Initialize the company as a customer
		const { transaction, error } = await initializeSubscription({
			email: company_email,
			amount: "5000",
		});

		if (error) {
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: "Subscription initialization failed." });
		}

		// Prepare subscription details
		const planName = `${payment_plan.toLowerCase()}_${billingType}`;
		const startDate = new Date();
		startDate.setDate(startDate.getDate() + 7); // 7-day trial period

		const {
			error: customerError,
			theCustomer,
			authorization,
		} = await getCustomer({
			email: company_email,
		});

		if (customerError) {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: customerError });
		}

		// create company subscription plan
		const { subscription, error: subscriptionError } = await createSubscription(
			{
				customer: theCustomer.id,
				plan: my_plans[planName],
				start_date: startDate,
				authorization: authorization.authorization_code,
			}
		);

		if (subscriptionError) {
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: "Subscription creation failed." });
		}

		// Check if the company already exists
		const existingCompany = await prisma.company.findUnique({
			where: { company_email },
		});

		if (existingCompany) {
			if (existingCompany.paymentStatus === "INACTIVE") {
				// Reactivate company and reconnect to the existing payment
				const paymentPlan = await prisma.companyPayments.findFirst({
					where: { company: { id: existingCompany.id } },
				});

				await prisma.company.update({
					where: { id: existingCompany.id },
					data: {
						paymentStatus: paymentPlan.status,
						CompanyPayments: { connect: { id: paymentPlan.id } },
					},
				});

				await handleOtpForCompany(existingCompany.company_email);

				return res.status(StatusCodes.OK).json({
					message: "Check your email for OTP",
					success: true,
				});
			}

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

			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Company already exists" });
		}

		// Create new company
		const hashedPassword = await hashPassword(password);
		const company = await prisma.company.create({
			data: {
				company_email,
				company_name,
				country,
				password: hashedPassword,
				paymentStatus: "ACTIVE",
			},
		});

		await prisma.companyPayments.create({
			data: {
				company: { connect: { id: company.id } },
				billType: billingType === "year" ? "YEARLY" : "MONTHLY",
				plan: payment_plan.toUpperCase(),
				status: "ACTIVE",
				authorization: {
					connectOrCreate: {
						where: { authorization_code: authorization.authorization_code },
						create: {
							...authorization,
							reusable: authorization.reusable === 1 ? true : false,
							companyId: company.id,
						},
					},
				},
			},
		});

		// Send OTP for verification
		await handleOtpForCompany(company.company_email);

		return res.status(StatusCodes.OK).json({
			message: "Company has been created.",
			company,
			transaction,
			subscription,
		});
	},
	verifyOtp: async (req, res) => {
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
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Invalid OTP", success: false });
		}

		// Mark OTP as verified
		await prisma.otp.update({
			where: { id: existingOtp.id },
			data: { verified: true },
		});

		// update company verified field
		const company = await prisma.company.update({
			where: { company_email: existingOtp.email },
			data: { verified: true },
		});

		// delete the otp
		await prisma.otp.delete({
			where: { id: existingOtp.id },
		});

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

		res
			.status(StatusCodes.OK)
			.json({ message: "OTP verified", success: true, jwtToken });
	},
	resendOtp: async (req, res) => {
		if (!req.body.email) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Email is required", success: false });
		}

		const existingUser = await prisma.users.findUnique({
			where: { email: req.body.email },
		});

		if (!existingUser) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No user was found with that email" });
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

		sendMail(existingToken.email, token, "Confirmation Code");

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

		res.status(StatusCodes.OK).json({ success: true, jwtToken });
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
		sendMail(email, token, "Confirmation Code");
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

		// get the current active subscriptions
		const {
			sub,
			nextBillingDate,
			cronTime,
			theCustomer,
			authorization,
			error,
		} = await getCustomerAndSubscription(email);

		if (error) {
			return res
				.StatusCodes(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: error });
		}

		// Cancel the previous subscription
		const { error: cancelError } = await cancelCustomerSubscription(sub);
		if (cancelError)
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: cancelError });

		// create a new subscription with a start date the date the previous one ends
		const planName = `${payment_plan.toLowerCase()}_${billingType}`;
		const { subscription, error: subscriptionError } = await createSubscription(
			{
				customer: theCustomer.id,
				plan: my_plans[planName],
				start_date: nextBillingDate,
				authorization: authorization.authorization_code,
			}
		);

		if (subscriptionError) {
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: "Subscription creation failed." });
		}

		// update the company payment plan on the db and also update the authorization
		const company = await prisma.company.findUnique({
			where: { id: company_id },
		});

		// make the cancel subscription be disabled until the next billing date
		await prisma.company.update({
			where: { id: company_id },
			data: { cancelable: false },
		});

		// update the plan on the next billing address
		cron.schedule(cronTime, () =>
			updateBillingPlan(
				company.companyPaymentsId,
				billingType,
				payment_plan,
				company.id
			)
		);

		// send a success message
		return res.status(StatusCodes.OK).json({
			msg: "Plan has been successfully changed.",
			theCustomer,
			authorization,
			sub,
			nextBillingDate,
			subscription,
		});
	},
	cancelSubscription: async (req, res) => {
		const { email, company_id } = req.user;

		// cancel the subscription
		// get the current active subscriptions
		const { sub, cronTime, error } = await getCustomerAndSubscription(email);

		if (error) {
			return res
				.StatusCodes(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: error });
		}

		// cancel subscription
		const { error: cancelError } = await cancelCustomerSubscription(sub);
		if (cancelError)
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ msg: cancelError });

		// set set update the the pay status as to INACTIVE when the end date is
		cron.schedule(cronTime, () => deActivateAccount(company_id));

		return res
			.status(StatusCodes.OK)
			.json({ msg: "Subscription cancelled successfully" });
	},
};
