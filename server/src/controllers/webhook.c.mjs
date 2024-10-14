import crypto from "crypto";
import { prisma } from "../utils/db.mjs";

const secret = process.env.PAYSTACKSECRETKEY;

const getCompany = async company_id => {
	const company = await prisma.company.findUnique({
		where: { id: company_id },
	});

	return company;
};

export const WebhookController = {
	webhook: async (req, res) => {
		const company = await getCompany(req.user.company_id);
		//validate event
		const hash = crypto
			.createHmac("sha512", secret)
			.update(JSON.stringify(req.body))
			.digest("hex");

		if (hash !== req.headers["x-paystack-signature"]) {
			return res.status(400).json({ msg: "Invalid signature" });
		}

		// Extract data from the webhook payload
		const event = req.body;

		switch (event.event) {
			case "subscription.create":
				res.status(200).json({ msg: "Subscription created" });
				break;
			case "invoice.create":
				res.status(200).json({ msg: "Invoice created" });
				break;
			case "charge.success":
				await prisma.company.update({
					where: { id: company.id },
					data: { paymentStatus: "ACTIVE" },
				});
				break;
			case "invoice.payment_failed":
				await prisma.company.update({
					where: { id: company.id },
					data: { paymentStatus: "INACTIVE" },
				});
				break;
			case "invoice.update":
				await prisma.company.update({
					where: { id: company.id },
					data: { paymentStatus: "ACTIVE", expires: event.data.period_end },
				});
				break;
			default:
				console.log("Unhandled event type: ", event.type);
				break;
		}
	},
};
