import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgen from "morgan";
import Routes from "./routes/index.mjs";
import "express-async-errors";
import crypto from "crypto";
import { prisma } from "./utils/db.mjs";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgen("common"));
app.use(cors());

// Route
app.use("/api", Routes);

app.get("/test", (req, res) => {
	return res.status(200).json({ msg: "API WORKING!!" });
});

// PayStack Webhook
app.post("/webhook", async (req, res) => {
	//validate event
	const hash = crypto
		.createHmac("sha512", process.env.PAYSTACKSECRETKEY)
		.update(JSON.stringify(req.body))
		.digest("hex");

	if (hash !== req.headers["x-paystack-signature"]) {
		return res.status(400).json({ msg: "Invalid signature" });
	}

	// Extract data from the webhook payload
	const payload = req.body;

	console.log({ payload });

	switch (payload.event) {
		case "subscription.create":
			res.status(200).json({ msg: "Subscription created" });
			break;
		case "charge.success":
			const getCompany = await prisma.company.findUnique({
				where: { company_email: payload.data.customer.email },
			});

			if (!getCompany) {
				return res.status(400).json({ msg: "Company not found" });
			}

			await prisma.company.update({
				where: { id: getCompany.id },
				data: {
					paymentStatus: "ACTIVE",
					payStackAuth: {
						connectOrCreate: {
							where: {
								authorization_code_signature: {
									authorization_code:
										payload.data.authorization.authorization_code,
									signature: payload.data.authorization.signature,
								},
								companyId: getCompany.id,
							},
							create: {
								authorization_code:
									payload.data.authorization.authorization_code,
								reusable: payload.data.authorization.reusable,
								bank: payload.data.authorization.bank,
								card_type: payload.data.authorization.card_type,
								exp_year: payload.data.authorization.exp_year,
								last4: payload.data.authorization.last4,
								status: payload.data.authorization.status,
								signature: payload.data.authorization.signature,
								account_name: payload.data.authorization.account_name,
								customerCode: payload.data.customer.customer_code,
							},
						},
					},
				},
			});

			console.log({ msg: "Payment successful" });
			break;
		case "invoice.payment_failed":
			console.log("Payment failed");
			break;
		default:
			console.log("Unhandled event type: ", payload.type);
			break;
	}
});

const PORT = 5001 | process.env.PORT;
const start = async () => {
	try {
		app.listen(PORT, () => {
			console.log(`server started on port: ${PORT}`);
		});
	} catch (error) {
		console.log(error);
	}
};

start();
