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
				invoiceNo: true,
				creditor: { select: { creditor_name: true } },
				customer: { select: { buyer_name: true } },
				status: true,
				createdAt: true,
			},
		});

		// Calculate total price for each invoice
		const invoicesWithTotalPrice = invoices.map(invoice => {
			const totalPrice = invoice.product.reduce(
				(acc, product) => acc + product.price,
				0
			);
			return { ...invoice, totalPrice }; // Include total price in each invoice object
		});

		return res
			.status(StatusCodes.OK)
			.json({ invoices: invoicesWithTotalPrice });
	},
	getInvoice: async (req, res) => {
		const invoice = await prisma.invoice.findUnique({
			where: {
				invoiceNo: req.params.invoiceNo,
				companyId: req.user.company_id,
			},
			include: {
				product: true,
				invoiceNo: true,
				creditor: true,
				customer: true,
				status: true,
				createdAt: true,
			},
		});

		if (!invoice) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No invoice with that id" });
		}

		return res.status(StatusCodes.OK).json({ invoice });
	},
};
