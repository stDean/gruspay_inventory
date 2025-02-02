import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import { DateTime } from "luxon";
import { scheduleJob } from "node-schedule";
import nodemailer from "nodemailer";
import PQueue from "p-queue";
import Routes from "./routes/index.mjs";
import { AuthScheduleController } from "./utils/AuthSchedule.mjs";
import { prisma } from "./utils/db.mjs";
import { JobLogger } from "./utils/JobLogger.mjs";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());

// Route
app.use("/api", Routes);

app.get("/test", (req, res) => {
	return res.status(200).json({ msg: "API WORKING!!" });
});

app.get("/jobs", (req, res) => {
	res.json(JobLogger.getLogs());
});

/* EMAIL SCHEDULING SYSTEM */
const emailQueue = new PQueue({
	concurrency: 2, // Process 2 emails at a time
	timeout: 30000, // 30 seconds per email
});

async function sendDailyEmails() {
	try {
		// Fetch active companies
		const companies = await prisma.company.findMany({
			where: { paymentStatus: "ACTIVE", verified: true },
			select: { id: true, company_name: true, company_email: true },
		});

		// Create a map for quick company lookup
		const companyMap = new Map(
			companies.map(c => [c.id, { ...c, unsold: [], sold: [] }])
		);

		// Parallel fetch of product data
		const [unsoldProducts, soldProducts] = await Promise.all([
			getUnsoldProducts(companies),
			getSoldProducts(companies),
		]);

		// Group unsold products by company ID
		unsoldProducts.forEach(product => {
			const company = companyMap.get(product.Company.id);
			if (company) company.unsold.push(product);
		});

		// Group sold products by company ID
		soldProducts.forEach(product => {
			const company = companyMap.get(product.Company.id);
			if (company) company.sold.push(product);
		});

		// Process emails for each company
		for (const [companyId, companyData] of companyMap) {
			await emailQueue.add(() => sendCompanyEmail(companyData));
		}
	} catch (error) {
		console.error("Email scheduling error:", error);
		throw error;
	}
}

async function getUnsoldProducts(companies) {
	return prisma.products.findMany({
		where: {
			createdAt: {
				gte: new Date(new Date().setHours(0, 0, 0, 0)),
				lte: new Date(new Date().setHours(23, 59, 59, 999)),
			},
			sales_status: "NOT_SOLD",
			companyId: { in: companies.map(c => c.id) },
		},
		select: {
			serial_no: true,
			product_name: true,
			price: true,
			purchase_date: true,
			AddedByUser: {
				select: { first_name: true, last_name: true, email: true },
			},
			Company: { select: { company_name: true, id: true } },
			Supplier: {
				select: {
					supplier_name: true,
					supplier_email: true,
					supplier_phone_no: true,
				},
			},
		},
	});
}

async function getSoldProducts(companies) {
	return prisma.products.findMany({
		where: {
			date_sold: {
				gte: new Date(new Date().setHours(0, 0, 0, 0)),
				lte: new Date(new Date().setHours(23, 59, 59, 999)),
			},
			companyId: { in: companies.map(c => c.id) },
			sales_status: { not: "NOT_SOLD" },
		},
		select: {
			serial_no: true,
			product_name: true,
			price: true,
			SoldByUser: {
				select: { first_name: true, last_name: true, email: true },
			},
			Company: { select: { company_name: true, id: true } },
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
}

async function sendCompanyEmail(companyData) {
	const { company_name, company_email, unsold, sold } = companyData;

	const transporter = nodemailer.createTransport({
		host: "smtp.zoho.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.ZOHO_USER,
			pass: process.env.ZOHO_PASS,
		},
	});

	try {
		const mailOptions = {
			from: process.env.ZOHO_USER,
			to: company_email,
			subject: `Daily Summary for ${company_name}`,
			html: generateEmailContent(company_name, unsold, sold),
		};

		await transporter.sendMail(mailOptions);
	} finally {
		transporter.close();
	}
}

function generateEmailContent(company, unsold, sold) {
	// HTML template implementation
	return `
    <h1>Daily Report for ${company}</h1>
    ${renderProductTable("Unsold Products", unsold)}
    ${renderProductTable("Sold Products", sold)}
  `;
}

function renderProductTable(title, products) {
	if (products.length === 0) {
		return `<h3>${title}</h3><p>No items found</p>`;
	}

	return `
    <h3>${title}</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          ${Object.keys(products[0])
						.map(key => `<th>${key.replace(/_/g, " ")}</th>`)
						.join("")}
        </tr>
      </thead>
      <tbody>
        ${products
					.map(
						product => `
            <tr>
              ${Object.values(product)
								.map(value => `<td>${formatValue(value)}</td>`)
								.join("")}
            </tr>
          `
					)
					.join("")}
      </tbody>
    </table>
  `;
}

// Helper function for formatting
function formatValue(value) {
	if (value instanceof Date) {
		return value.toLocaleDateString();
	}

	if (typeof value === "object" && value !== null) {
		// Handle user objects (AddedByUser/SoldByUser)
		if ("first_name" in value || "last_name" in value) {
			const firstName = value.first_name || "";
			const lastName = value.last_name || "";
			const fullName = `${firstName} ${lastName}`.trim();

			// Fallback to email if no names exist
			return fullName || value.email || "Unknown User";
		}

		// Handle company object
		if (value.company_name) {
			return value.company_name;
		}

		// Handle supplier object
		if (value.supplier_name) {
			return value.supplier_name;
		}

		// Handle customer object
		if (value.buyer_name) {
			return value.buyer_name;
		}

		// Fallback for other objects
		return JSON.stringify(value);
	}

	return value;
}

/* SUBSCRIPTION SCHEDULING SYSTEM */
function initializeSubscriptionJobs() {
	// Daily check for pending subscription updates
	scheduleJob("0 12 * * *", async () => {
		// 12 PM UTC (8 AM EST)
		try {
			console.log("Checking for pending subscription updates...");
			await AuthScheduleController.processPendingSubscriptions();
		} catch (error) {
			console.error("Subscription update check failed:", error);
		}
	});

	// Hourly cleanup of expired scheduling data
	scheduleJob("0 * * * *", async () => {
		const sixMonthsAgo = DateTime.now().minus({ months: 6 }).toJSDate();
		await prisma.company.updateMany({
			where: {
				AND: [
					{ nextBillingDate: { lte: sixMonthsAgo } },
					{ pendingPlanUpdate: { not: null } },
				],
			},
			data: {
				pendingPlanUpdate: null,
				nextBillingDate: null,
			},
		});
	});
}

// Schedule daily emails at 11:55 PM local time (converted to UTC)
function scheduleEmailJobs() {
	scheduleJob("55 23 * * *", async () => {
		console.log("Starting daily email processing...");
		try {
			await sendDailyEmails();
			console.log("Daily email processing completed");
		} catch (error) {
			console.error("Daily email job failed:", error);
		}
	});
}

async function setupScheduledJobs() {
	try {
		// Initialize subscription-related jobs
		await AuthScheduleController.initializeScheduledJobs();
		initializeSubscriptionJobs();

		// Schedule email jobs
		scheduleEmailJobs();

		console.log("All scheduled jobs initialized");
	} catch (error) {
		console.error("Failed to initialize scheduled jobs:", error);
		throw error;
	}
}

/* SERVER MANAGEMENT */
function validateEnvironment() {
	const requiredVars = [
		"PAYSTACKSECRETKEY",
		"ZOHO_USER",
		"ZOHO_PASS",
		"DATABASE_URL",
	];

	requiredVars.forEach(varName => {
		if (!process.env[varName]) {
			throw new Error(`Missing required environment variable: ${varName}`);
		}
	});
}

function setupGracefulShutdown(server) {
	const shutdown = async signal => {
		console.log(`Received ${signal}, shutting down...`);

		// Close server first
		server.close(async () => {
			console.log("HTTP server closed");

			// Disconnect Prisma
			await prisma.$disconnect();
			console.log("Database connection closed");

			process.exit(0);
		});

		// Force shutdown after timeout
		setTimeout(() => {
			console.error("Forcing shutdown after timeout");
			process.exit(1);
		}, 10000);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

/* APPLICATION STARTUP */
async function startServer() {
	try {
		// Validate configuration
		validateEnvironment();

		// Connect to database
		await prisma.$connect();
		console.log("Database connected successfully");

		// Initialize all scheduled jobs
		await setupScheduledJobs();

		// Start server
		const port = process.env.PORT || 5001;
		const server = app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});

		// Configure graceful shutdown
		setupGracefulShutdown(server);
	} catch (error) {
		console.error("Server startup failed:", error);
		process.exit(1);
	}
}

// Start the application
startServer();
