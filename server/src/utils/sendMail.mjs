import nodemailer from "nodemailer";
import { prisma } from "./db.mjs";

// Nodemailer transporter for Zoho Mail
const transporter = nodemailer.createTransport({
	host: "smtp.zoho.com", // Zoho Mail SMTP server
	port: 465, // SMTP port (465 for SSL)
	secure: true, // Use SSL
	auth: {
		user: process.env.ZOHO_USER, // Zoho email
		pass: process.env.ZOHO_PASS, // Zoho app password
	},
});

/**
 * Send an email using Zoho Mail
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} [html] - Optional HTML body
 */
export const sendNodeMail = async (to, subject, text = "", html = "") => {
	try {
		const mailOptions = {
			from: process.env.ZOHO_USER,
			to,
			subject,
			text,
			html,
		};
		const info = await transporter.sendMail(mailOptions);
		return info;
	} catch (error) {
		throw new Error(`Failed to send email: ${error.message}`);
	}
};

/**
 * Generate OTP HTML template
 * @param {string} token - OTP token (6 characters)
 */
export const otpHtml = token => {
	if (!token || token.length !== 6) {
		throw new Error("Invalid token: OTP must be exactly 6 characters long.");
	}

	return `
    <div style="width: 700px; margin: auto; font-family: Arial, sans-serif;">
      <p style="font-size: 1.5rem; color: #333;">Hi there,</p>
      <p style="font-size: 16px; color: #555;">This is your verification code:</p>
      <div style="font-size: 24px; font-weight: bold; color: #050201; margin: 20px 0;">
        ${token
					.split("")
					.map(
						(char, index) =>
							`<span style="border: 2px solid #ff5722; padding: 6px 12px; margin: 0 2px; display: inline-block; border-radius: 5px;">${char}</span>`
					)
					.join("")}
      </div>
      <p style="font-size: 16px; color: #555;">This code will be valid for the next 5 minutes.</p>
      <p>Thanks,<br />Cauntr Team</p>
    </div>
  `;
};

/**
 * Send invoice email
 * @param {string} invoiceNo - Invoice number
 */
export const sendNodeInvoice = async invoiceNo => {
	const invoice = await prisma.invoice.findUnique({
		where: { invoiceNo },
		include: {
			product: { include: { IncomingProducts: true, OutgoingProduct: true } },
			company: true,
			customer: true,
			creditor: true,
		},
	});

	if (!invoice) {
		throw new Error("Invoice not found.");
	}

	const customerEmail =
		invoice.customer?.buyer_email || invoice.creditor?.creditor_email;
	const customerName =
		invoice.customer?.buyer_name || invoice.creditor?.creditor_name;

	let products = [];
	let outgoingProducts = [];
	let incomingProducts = [];
	let grandTotal = 0;

	// Process products based on invoice type
	if (invoice.status === "SWAP") {
		const swap = await prisma.swaps.findUnique({
			where: { id: invoice.product[0].swapsOutId },
			include: { incomingProducts: true, outgoingProducts: true },
		});
		if (swap) {
			outgoingProducts = processIndividualProducts(
				swap.outgoingProducts,
				"bought_for"
			);
			incomingProducts = processIndividualProducts(
				swap.incomingProducts,
				"price"
			);
		}
	} else {
		products = processIndividualProducts(invoice.product, "bought_for");
		grandTotal = calculateGrandTotal(products);
	}

	const emailHtml = generateEmailHtml(
		invoice,
		products,
		grandTotal,
		outgoingProducts,
		incomingProducts,
		customerName
	);

	const mailOptions = {
		from: process.env.ZOHO_USER,
		to: customerEmail,
		subject: `Customer Invoice - ${invoice.invoiceNo}`,
		html: emailHtml,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		return info;
	} catch (error) {
		throw new Error(`Failed to send invoice: ${error.message}`);
	}
};

/**
 * Process products into individual data
 * @param {Array} products - List of products
 * @param {string} priceField - Field for price lookup
 */
const processIndividualProducts = (products, priceField) =>
	products.map(product => ({
		name: product.product_name,
		description: product.description,
		serialNo: product.serial_no,
		price: parseFloat(product[priceField]) || 0,
	}));

/**
 * Calculate grand total from individual products
 * @param {Array} products - List of individual product data
 */
const calculateGrandTotal = products =>
	products.reduce((sum, { price }) => sum + price, 0);

/**
 * Generate invoice email HTML
 * @param {Object} invoice - Invoice data
 * @param {Array} products - List of products
 * @param {number} grandTotal - Grand total for products
 * @param {Array} outgoingProducts - Outgoing products for swaps
 * @param {Array} incomingProducts - Incoming products for swaps
 * @param {string} customerName - Customer's name
 */
const generateEmailHtml = (
	invoice,
	products,
	grandTotal,
	outgoingProducts,
	incomingProducts,
	customerName
) => `
  <div style="width: 700px; margin: auto; font-family: Arial, sans-serif; color: #333;">
    <p>Hi, ${customerName},</p>
    <p>Thank you for your business. Below are the details of your invoice:</p>
    <p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
    <p><strong>Generated On:</strong> ${new Date(
			invoice.updatedAt
		).toLocaleDateString()}</p>
    ${
			invoice.status === "SWAP"
				? `
          <h3>Outgoing Products:</h3>
          ${createProductTable(outgoingProducts)}
          <h3>Incoming Products:</h3>
          ${createProductTable(incomingProducts)}
        `
				: `
          <h3>Products:</h3>
          ${createProductTable(products)}
          <p style="text-align: right; font-weight: bold;">Grand Total: ₦${grandTotal}</p>
        `
		}
    ${
			invoice.balance_due > 0
				? `<p style="color: #d9534f; font-weight: bold;">Balance Owed: ₦${invoice.balance_due}</p>`
				: ""
		}
    <p>Thanks,<br>${invoice.company.company_name}</p>
  </div>
`;

/**
 * Create product table HTML
 * @param {Array} products - List of individual product data
 */
const createProductTable = products => `
  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    <thead>
      <tr style="background-color: #f5f5f5;">
        <th style="padding: 10px; text-align: left;">Product</th>
        <th style="padding: 10px; text-align: center;">Serial No</th>
        <th style="padding: 10px; text-align: left;">Description</th>
        <th style="padding: 10px; text-align: right;">Price (₦)</th>
      </tr>
    </thead>
    <tbody>
      ${products
				.map(
					({ name, serialNo, description, price }) => `
          <tr>
            <td style="padding: 10px;">${name}</td>
            <td style="padding: 10px; text-align: center;">${serialNo}</td>
            <td style="padding: 10px; text-align: left;">${description}</td>
            <td style="padding: 10px; text-align: right;">₦${price}</td>
          </tr>
        `
				)
				.join("")}
    </tbody>
  </table>
`;
