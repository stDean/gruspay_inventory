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

	return tx.company.update({
		where: { company_email: customer.email },
		data: {
			paymentStatus: "ACTIVE",
			payStackAuth: {
				connectOrCreate: {
					where: {
						authorization_code_signature: {
							authorization_code: authorization.authorization_code,
							signature: authorization.signature,
						},
					},
					create: {
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
					},
				},
			},
		},
	});
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
		data: { paymentStatus: "INACTIVE" },
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
		data: { expires: new Date(subscription?.next_payment_date) },
	});
};

// Main webhook handler
router.route("/webhook").post(validatePayStackSignature, async (req, res) => {
	try {
		const result = await prisma.$transaction(async tx => {
			const { event, data } = req.body;
			console.log(data);

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
				case "charge.success":
					processedData = await handleChargeSuccess(data, tx);
					break;
				case "invoice.payment_failed":
					processedData = await handlePaymentFailed(data, tx);
					break;
				case "invoice.update":
					processedData = await handleInvoiceSuccess(data, tx);
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
