import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgen from "morgan";
import Routes from "./routes/index.mjs";
import "express-async-errors";
import crypto from "crypto";
import { prisma } from "./utils/db.mjs";
import nodemailer from "nodemailer";
import { scheduleJob } from "node-schedule";

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

	switch (payload.event) {
		case "subscription.create":
			console.log({ msg: "Subscription created" });
			break;
		case "charge.success":
			const getCompany = await prisma.company.findUnique({
				where: { company_email: payload.data.customer.email },
			});

			if (!getCompany) {
				console.log("Company not found");
				return;
			}

			await prisma.company.update({
				where: { id: getCompany.id, company_email: getCompany.company_email },
				data: {
					paymentStatus: "ACTIVE",
					expires: payload.data.next_payment_date,
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
								transactionId: payload.data.id.toString(),
							},
						},
					},
				},
			});

			await prisma.company.update({
				where: { id: getCompany.id },
				data: {},
			});

			console.log({ msg: "Payment successful" });
			break;
		case "invoice.payment_failed":
			const comp = await prisma.company.findUnique({
				where: { company_email: payload.data.customer.email },
			});

			if (!comp) {
				console.log("Company not found");
				return;
			}

			await prisma.company.update({
				where: { id: comp.id },
				data: { paymentStatus: "INACTIVE", transactionId: payload.data.id },
			});

			console.log({ msg: "Payment failed" });
			break;
		default:
			console.log("Unhandled event type: ", payload.type);
			break;
	}
});

// Send Daily Emails
const sendDailyEmails = async () => {
	try {
		// Fetch active and verified companies
		const company = await prisma.company.findMany({
			where: { paymentStatus: "ACTIVE", verified: true },
			select: { company_email: true, id: true, company_name: true },
		});

		// Get products not sold today
		const productNotSoldToday = await prisma.products.findMany({
			where: {
				createdAt: {
					gte: new Date(new Date().setHours(0, 0, 0, 0)),
					lte: new Date(new Date().setHours(23, 59, 59, 999)),
				},
				sales_status: "NOT_SOLD",
				companyId: { in: company.map(c => c.id) },
			},
			select: {
				serial_no: true,
				product_name: true,
				price: true,
				purchase_date: true,
				AddedByUser: {
					select: { first_name: true, last_name: true, email: true },
				},
				Company: { select: { company_name: true } },
				Supplier: {
					select: {
						supplier_name: true,
						supplier_email: true,
						supplier_phone_no: true,
					},
				},
			},
		});

		// Group not sold products by company
		const groupedByCompany = productNotSoldToday.reduce((acc, product) => {
			const companyName = product.Company.company_name;
			if (!acc[companyName]) acc[companyName] = [];
			acc[companyName].push({
				serial_no: product.serial_no,
				product_name: product.product_name,
				price: product.price,
				purchase_date: new Date(product.purchase_date).toDateString(),
				supplier_name: product.Supplier.supplier_name,
				supplier_email: product.Supplier.supplier_email,
				supplier_phone_no: product.Supplier.supplier_phone_no,
				addedBy:
					product.AddedByUser.first_name + " " + product.AddedByUser.last_name,
			});
			return acc;
		}, {});

		// Get sold and swapped products
		const getSoldAndSwappedToday = await prisma.products.findMany({
			where: {
				date_sold: {
					gte: new Date(new Date().setHours(0, 0, 0, 0)),
					lte: new Date(new Date().setHours(23, 59, 59, 999)),
				},
				companyId: { in: company.map(c => c.id) },
				sales_status: { not: "NOT_SOLD" },
			},
			select: {
				serial_no: true,
				product_name: true,
				price: true,
				SoldByUser: {
					select: { first_name: true, last_name: true, email: true },
				},
				Company: { select: { company_name: true } },
				bought_for: true,
				balance_owed: true,
				Customer: {
					select: { buyer_name: true, buyer_email: true, buyer_phone_no: true },
				},
				Creditor: {
					select: {
						creditor_name: true,
						creditor_email: true,
						creditor_phone_no: true,
					},
				},
				sales_status: true,
			},
		});

		// Group sold and swapped products by company
		const groupedSoldByCompany = getSoldAndSwappedToday.reduce(
			(acc, product) => {
				const companyName = product.Company.company_name;
				if (!acc[companyName]) acc[companyName] = [];
				acc[companyName].push({
					serial_no: product.serial_no,
					product_name: product.product_name,
					price: product.price,
					sold_by:
						product.SoldByUser.first_name + " " + product.SoldByUser.last_name,
					bought_for: product.bought_for,
					balance: product.balance_owed,
					customerName:
						product.balance_owed !== "0"
							? product.Creditor.creditor_name
							: product.Customer.buyer_name,
					customerEmail:
						product.balance_owed !== "0"
							? product.Creditor.creditor_email
							: product.Customer.buyer_email,
					customerPhone:
						product.balance_owed !== "0"
							? product.Creditor.creditor_phone_no
							: product.Customer.buyer_phone_no,
					sales_status: product.sales_status,
				});
				return acc;
			},
			{}
		);

		// Configure the email transporter
		const transporter = nodemailer.createTransport({
			host: "smtp.zoho.com", // Zoho Mail SMTP server
			port: 465, // SMTP port (465 for SSL)
			secure: true, // Use SSL
			auth: {
				user: process.env.ZOHO_USER, // Zoho email
				pass: process.env.ZOHO_PASS, // Zoho app password
			},
		});

		// Send emails to each company
		for (const c of company) {
			const notSold = groupedByCompany[c.company_name] || [];
			const soldAndSwapped = groupedSoldByCompany[c.company_name] || [];

			// Prepare the email content
			// Create email content as an HTML table
			const emailContent = `
       <h1>Daily Summary for ${c.company_name}</h1>
       <h2>Products Added Today:</h2>
       ${
					notSold.length === 0
						? `<p style="color: green; font-weight: bold; margin-top: 5px; margin-bottom: 5px; font-size: 20px">No product added today.</p>`
						: `
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Purchase Date</th>
              <th>Added By</th>
              <th>Supplier Name</th>
              <th>Supplier Email</th>
              <th>Supplier Phone</th>
            </tr>
          </thead>
          <tbody>
            ${notSold
							.map(
								product => `
                <tr>
                  <td>${product.serial_no}</td>
                  <td>${product.product_name}</td>
                  <td>$${product.price}</td>
                  <td>${product.purchase_date}</td>
                  <td>${product.addedBy}</td>
                  <td>${product.supplier_name}</td>
                  <td>${product.supplier_email}</td>
                  <td>${product.supplier_phone_no}</td>
                </tr>`
							)
							.join("")}
          </tbody>
        </table>
 
        ${notSold
					.map(
						product => `
             ${
								product.price === "0" &&
								`<p style="color: blue; font-weight: bold; margin-top: 5px; margin-bottom: 5px; font-size: 20px">Some products price need to be updated.</p>`
							}
             `
					)
					.join("")}
        `
				}

       <h2>Sold and Swapped Products Today:</h2>
       ${
					soldAndSwapped.length === 0
						? `<p style="color: green; font-weight: bold; margin-top: 5px; margin-bottom: 5px; font-size: 20px">No products sold or swapped today.</p>`
						: `
            <table border="1" cellspacing="0" cellpadding="5">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Sold By</th>
                  <th>Bought For</th>
                  <th>Balance</th>
                  <th>Customer Name</th>
                  <th>Customer Email</th>
                  <th>Customer Phone</th>
                  <th>Sales Status</th>
                </tr>
              </thead>
              <tbody>
                ${soldAndSwapped
									.map(
										product => `
                    <tr>
                      <td>${product.serial_no}</td>
                      <td>${product.product_name}</td>
                      <td>$${product.price}</td>
                      <td>${product.sold_by}</td>
                      <td>$${product.bought_for}</td>
                      <td>$${product.balance}</td>
                      <td>${product.customerName}</td>
                      <td>${product.customerEmail}</td>
                      <td>${product.customerPhone}</td>
                      <td>${product.sales_status}</td>
                    </tr>`
									)
									.join("")}
            `
				}
         </tbody>
       </table>
   `;

			// Send the email
			await transporter.sendMail({
				from: process.env.ZOHO_USER,
				to: c.company_email,
				subject: `Daily Summary for ${c.company_name}`,
				html: emailContent,
			});
		}

		return { message: "Daily summary emails sent successfully." };
	} catch (error) {
		console.error("Error sending daily emails:", error);
	}
};

// Schedule the job to run at 10:00 PM every day
// scheduleJob("59 21 * * *", () => {
// 	console.log("Daily email sending schedule...");
// 	sendDailyEmails();
// });

const PORT = 5001 | process.env.PORT;
const start = async () => {
	try {
		app.listen(PORT, () => {
			console.log(`server started on port: ${PORT}`);
		});

		// Gracefully close Prisma client when the process terminates
		process.on("SIGINT", async () => {
			console.log("SIGINT received: closing Prisma client");
			await prisma.$disconnect();
			process.exit(0);
		});

		process.on("SIGTERM", async () => {
			console.log("SIGTERM received: closing Prisma client");
			await prisma.$disconnect();
			process.exit(0);
		});
	} catch (error) {
		console.log(error);
	}
};

start();
