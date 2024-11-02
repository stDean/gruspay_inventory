import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";

export const InvoiceCtrl = {
	getAllInvoices: async (req, res) => {
		const { company_id } = req.user;

		const invoices = await prisma.invoice.findMany({
			where: {
				companyId: company_id,
			},
			include: {
				product: true,
				creditor: { select: { creditor_name: true } },
				customer: { select: { buyer_name: true } },
			},
		});

		// Format each invoice to only include the desired fields
		const formattedInvoices = invoices.map(invoice => {
			const totalPrice = invoice.product.reduce(
				(acc, product) => acc + parseFloat(product.bought_for), // Ensure bought_for is a number
				0
			);

			return {
				id: invoice.invoiceNo,
				customer: invoice.creditor
					? invoice.creditor.creditor_name
					: invoice.customer?.buyer_name || "Unknown",
				date: invoice.createdAt.toLocaleDateString("en-GB"), // Format date as "dd-mm-yyyy"
				price: totalPrice.toFixed(2), // Convert price to string with two decimal places
				status:
					invoice.status.charAt(0).toUpperCase() +
					invoice.status.slice(1).toLowerCase(), // Capitalize status
			};
		});

		return res.status(StatusCodes.OK).json({ invoices: formattedInvoices });
	},
	getInvoice: async (req, res) => {
		const invoice = await prisma.invoice.findUnique({
			where: {
				invoiceNo: req.params.invoiceNo,
				companyId: req.user.company_id,
			},
			include: {
				product: true,
				creditor: {
					select: {
						creditor_name: true,
						creditor_email: true,
						creditor_phone_no: true,
					},
				},
				customer: {
					select: {
						buyer_name: true,
						buyer_email: true,
						buyer_phone_no: true,
					},
				},
				company: {
					select: {
						company_name: true,
						company_email: true,
						country: true,
					},
				},
			},
		});

		if (!invoice) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No invoice with that id" });
		}

		// Calculate grandTotal and format response
		const itemsPurchased = invoice.product.map(product => ({
			name: product.name,
			qty: 1, // Assuming each product entry is a single item
			price: parseFloat(product.bought_for), // Convert bought_for to a number
			totalPrice: parseFloat(product.bought_for), // Since qty is 1, totalPrice is same as price
		}));

		const grandTotal = itemsPurchased
			.reduce(
				(acc, item) => acc + item.totalPrice,
				parseFloat(invoice.balance_due) || 0 // Add balance_owed to grand total
			)
			.toFixed(2);

		const formattedInvoice = {
			status: invoice.status,
			invoiceNo: invoice.invoiceNo,
			balance_due: invoice.balance_due || "0.00",
			createdAt: invoice.createdAt.toLocaleDateString("en-GB"),
			updatedAt: invoice.updatedAt.toLocaleDateString("en-GB"),
			customer: invoice.creditor
				? {
						customerName: invoice.creditor.creditor_name,
						customerNo: invoice.creditor.creditor_phone_no || "N/A",
						customerEmail: invoice.creditor.creditor_email || "N/A",
				  }
				: invoice.customer
				? {
						customerName: invoice.customer.buyer_name,
						customerNo: invoice.customer.buyer_phone_no || "N/A",
						customerEmail: invoice.customer.buyer_email || "N/A",
				  }
				: undefined,
			company: {
				companyName: invoice.company.company_name,
				companyEmail: invoice.company.company_email,
				companyLocation: invoice.company.country,
			},
			itemsPurchased,
			grandTotal,
		};

		return res.status(StatusCodes.OK).json({ invoice: formattedInvoice });
	},
};
