import nodeMailer from "nodemailer";
import { google } from "googleapis";
import { prisma } from "./db.mjs";

const { OAuth2 } = google.auth;

const { GOOGLE_CLIENT_ID, GOOGLE_SECRET, GOOGLE_REFRESH_TOKEN, SENDERS_EMAIL } =
	process.env;

const oAuth2Client = new OAuth2(
	GOOGLE_CLIENT_ID,
	GOOGLE_SECRET,
	GOOGLE_REFRESH_TOKEN,
	SENDERS_EMAIL
);

export const sendInvoice = async invoiceNo => {
	oAuth2Client.setCredentials({
		refresh_token: GOOGLE_REFRESH_TOKEN,
	});
	const accessToken = oAuth2Client.getAccessToken();
	const smtpTransort = nodeMailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: SENDERS_EMAIL,
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_SECRET,
			refreshToken: GOOGLE_REFRESH_TOKEN,
			accessToken,
		},
	});

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

	let productGroups = {};
	let grandTotal = 0;
	let outgoingProducts = {};
	let incomingProducts = {};

	// If the invoice is a swap, get swap details
	if (invoice.status === "SWAP") {
		const swap = await prisma.swaps.findUnique({
			where: { id: invoice.product[0].swapsOutId },
			include: { incomingProducts: true, outgoingProducts: true },
		});

		if (swap) {
			outgoingProducts = swap.outgoingProducts.reduce((acc, product) => {
				const { product_name, bought_for } = product;
				const price = Number(bought_for);
				if (!acc[product_name]) {
					acc[product_name] = { qty: 1, unitPrice: price, totalPrice: price };
				} else {
					acc[product_name].qty += 1;
					acc[product_name].totalPrice = price * acc[product_name].qty;
				}
				return acc;
			}, {});

			incomingProducts = swap.incomingProducts.reduce((acc, product) => {
				const { product_name, price } = product;
				const p = Number(price);
				if (!acc[product_name]) {
					acc[product_name] = { qty: 1, unitPrice: p, totalPrice: p };
				} else {
					acc[product_name].qty += 1;
					acc[product_name].totalPrice = p * acc[product_name].qty;
				}
				return acc;
			}, {});
		}
	} else {
		productGroups = invoice.product.reduce((acc, product) => {
			const { product_name, bought_for } = product;
			const price = Number(bought_for);
			if (!acc[product_name]) {
				acc[product_name] = { qty: 1, unitPrice: price, totalPrice: price };
			} else {
				acc[product_name].qty += 1;
				acc[product_name].totalPrice = price * acc[product_name].qty;
			}
			return acc;
		}, {});

		grandTotal = Object.values(productGroups).reduce(
			(sum, { totalPrice }) => sum + totalPrice,
			0
		);
	}

	const customer =
		invoice.customer?.buyer_email || invoice.creditor?.creditor_email;
	const customerName =
		invoice.customer?.buyer_name || invoice.creditor?.creditor_name;

	const mailOptions = {
		from: SENDERS_EMAIL,
		to: customer,
		subject: `Customer Invoice - ${invoice.invoiceNo}`,
		generateTextFromHTML: true,
		html: `
      <div style="width: 700px; margin: auto; font-family: Arial, sans-serif; color: #333;">
        <div style="margin-bottom: 1.5rem; font-size: 1.5rem;">
          <p>Hi, ${customerName}</p>
          <p>Thank you for your business. Here is your invoice with the details:</p>
        </div>

        ${
					invoice.status === "SWAP"
						? `
            <h3>Products Bought:</h3>
            ${createProductTable(outgoingProducts)}
            <h3>Products Received:</h3>
            ${createProductTable(incomingProducts)}
          `
						: createProductTable(productGroups)
				}

        ${
					invoice.status !== "SWAP"
						? `
						<p style="margin-top: 1.5rem; font-weight: bold; text-align: right;">
							Grand Total: ₦${grandTotal}
						</p>
					`
						: ""
				}

        ${
					invoice.balance_due && invoice.balance_due > 0
						? `
          <div style="margin-top: 1.5rem; padding: 10px; background-color: #ffefef; border: 1px solid #f5c2c2; border-radius: 8px;">
            <p style="font-size: 1.1rem; color: #d9534f;">
              <strong>Balance Owed: </strong>₦${invoice.balance_due}
            </p>
          </div>
        `
						: ""
				}

        <p style="margin-top: 1.5rem; line-height: 1.4rem;">
          Thank you for your patronage!<br>
          We look forward to serving you again soon.
        </p>
      </div>
    `,
	};

	smtpTransort.sendMail(mailOptions, (err, info) => {
		if (err) return err;
		return info;
	});
};

// Helper function to create product table HTML
const createProductTable = productGroup => `
  <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f5f5f5; text-align: left;">
          <th style="padding: 10px; border-bottom: 1px solid #ddd;">Product Name</th>
          <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Quantity</th>
          <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Unit Price (₦)</th>
          <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Total Price (₦)</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(productGroup)
					.map(
						([product_name, { qty, unitPrice, totalPrice }]) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${product_name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${qty}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${unitPrice}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${totalPrice}</td>
              </tr>
            `
					)
					.join("")}
      </tbody>
    </table>
  </div>
`;
