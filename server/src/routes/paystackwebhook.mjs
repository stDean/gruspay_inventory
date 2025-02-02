import { prisma } from "../utils/db.mjs";
import express from "express";
import crypto from "crypto";

const router = express.Router();

// Middleware to validate PayStack signature
const validatePayStackSignature = async (req, res, next) => {
	try {
		const signature = crypto
			.createHmac("sha512", process.env.PAYSTACKSECRETKEY)
			.update(JSON.stringify(req.body))
			.digest("hex");

		if (signature !== req.headers["x-paystack-signature"]) {
			return res.status(401).json({ error: "Invalid signature" });
		}

		next();
	} catch (error) {
		console.error("Signature validation error:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

// Charge success handler
const handleChargeSuccess = async (data, tx) => {
	const { customer, authorization } = data;

	if (!customer?.email || !authorization?.authorization_code) {
		console.log("Invalid charge success payload");
		return;
	}

	// Retrieve the company along with its associated PayStackAuth
	const company = await prisma.company.findUnique({
		where: { company_email: customer.email },
		include: { payStackAuth: true },
	});
	if (!company) {
		console.log("Company not found");
		return;
	}

	// Define the new auth data for easy reuse
	const newAuthData = {
		authorization_code: authorization.authorization_code,
		reusable: authorization.reusable,
		bank: authorization.bank,
		card_type: authorization.card_type,
		exp_year: authorization.exp_year,
		last4: authorization.last4,
		status: authorization.status,
		signature: authorization.signature,
		account_name: authorization.account_name,
		customerCode: customer.customer_code,
		transactionId: data.id.toString(),
	};

	// Check if the company already has a PayStackAuth record
	if (company.payStackAuth) {
		// Compare existing auth values with the new ones.
		// You can adjust which fields need to be checked.
		const auth = company.payStackAuth;
		const valuesAreDifferent =
			auth.authorization_code !== authorization.authorization_code ||
			auth.signature !== authorization.signature ||
			auth.reusable !== authorization.reusable ||
			auth.bank !== authorization.bank ||
			auth.card_type !== authorization.card_type ||
			auth.exp_year !== authorization.exp_year ||
			auth.last4 !== authorization.last4 ||
			auth.status !== authorization.status ||
			auth.account_name !== authorization.account_name ||
			auth.customerCode !== customer.customer_code ||
			auth.transactionId !== data.id.toString();

		if (valuesAreDifferent) {
			// Delete the existing PayStackAuth record
			await tx.payStackAuth.delete({
				where: { id: auth.id },
			});

			// Now update the company with a new PayStackAuth record
			return await tx.company.update({
				where: { company_email: customer.email },
				data: {
					paymentStatus: "ACTIVE",
					payStackAuth: {
						create: newAuthData,
					},
				},
			});
		} else {
			// If values are the same, simply update the payment status
			return await tx.company.update({
				where: { company_email: customer.email },
				data: { paymentStatus: "ACTIVE" },
			});
		}
	} else {
		// If there is no PayStackAuth record, create one
		return await tx.company.update({
			where: { company_email: customer.email },
			data: {
				paymentStatus: "ACTIVE",
				payStackAuth: {
					create: newAuthData,
				},
			},
		});
	}
};

// Payment failed handler
const handlePaymentFailed = async (data, tx) => {
	const { customer } = data;

	if (!customer?.email) {
		console.log("Invalid payment failed payload");
		return;
	}

	return tx.company.update({
		where: { company_email: customer.email },
		data: {
			paymentStatus: "INACTIVE",
			canUpdate: true,
			cancelable: false,
			expires: null,
		},
	});
};

// Invoice success handler
const handleInvoiceSuccess = async (data, tx) => {
	const { customer, subscription } = data;

	if (!customer?.email) {
		console.log("Invalid payment failed payload");
		return;
	}

	return tx.company.update({
		where: { company_email: customer.email },
		data: {
			expires: new Date(subscription?.next_payment_date),
			paymentStatus: "ACTIVE",
			canUpdate: true,
			cancelable: true,
		},
	});
};

const handleSubCreated = async (data, tx) => {
	const { next_payment_date, customer } = data;

	if (!customer?.email) {
		console.log("Invalid payment failed payload");
		return;
	}

	return tx.company.update({
		where: { company_email: customer.email },
		data: {
			expires: new Date(next_payment_date),
			paymentStatus: "ACTIVE",
			canUpdate: true,
			cancelable: true,
		},
	});
};

const handleSubscriptionDisable = async (data, tx) => {
	const { customer } = data;
	if (!customer?.email) {
		console.log("Invalid payment failed payload");
		return;
	}

	return await tx.company.update({
		where: { company_email: customer.email },
		data: {
			paymentStatus: "INACTIVE",
			canUpdate: true,
			cancelable: false,
			expires: null,
		},
	});
};

// Main webhook handler
router.route("/webhook").post(validatePayStackSignature, async (req, res) => {
	try {
		const result = await prisma.$transaction(async tx => {
			const { event, data } = req.body;

			console.log({ event });

			// Validate payload structure
			if (!event || !data?.id) {
				res.status(400).json({ error: "Invalid payload structure" });
				return null;
			}

			// Check for duplicate event
			const existingEvent = await tx.webhookEvent.findUnique({
				where: { eventId: String(data.id) },
			});

			if (existingEvent) {
				res.status(200).json({ status: "Event already processed" });
				return null;
			}

			// Process event
			let processedData;
			switch (event) {
				case "subscription.create":
					console.log("subscription.create");
					processedData = await handleSubCreated(data, tx);
					break;
				case "charge.success":
					console.log("charge.success");
					processedData = await handleChargeSuccess(data, tx);
					break;
				case "invoice.payment_failed":
					console.log("invoice.payment_failed");
					processedData = await handlePaymentFailed(data, tx);
					break;
				case "invoice.update":
					console.log("invoice.update");
					processedData = await handleInvoiceSuccess(data, tx);
					break;
				case "subscription.not_renew":
					console.log("subscription.not_renew");
					processedData = await handleSubscriptionDisable(data, tx);
					break;
				case "subscription.disable":
					console.log("subscription.disable");
					processedData = await handleSubscriptionDisable(data, tx);
					break;
				default:
					console.warn(`Unhandled event type: ${event}`);
					res.status(200).json({ status: "Event not handled" });
					return null;
			}

			// Record successful processing
			await tx.webhookEvent.create({
				data: { eventId: String(data.id) },
			});

			return processedData;
		});

		// Only send success response if transaction completed
		if (result !== null) {
			return res.status(200).json({
				status: "Webhook processed successfully",
				data: result,
			});
		}
	} catch (error) {
		console.error("Webhook processing error:", error);
		const statusCode = error.message.includes("Invalid") ? 400 : 500;
		return res.status(statusCode).json({
			error: error.message || "Internal server error",
		});
	}
});

export default router;
