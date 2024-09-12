import { prisma } from "../utils/db.mjs";
import { StatusCodes } from "http-status-codes";

export const SupplierCtrl = {
	createSupplier: async (req, res) => {
		const {
			user: { company_id, email: userEmail },
			body: { full_name, phone_number, suppliersEmail, productId },
		} = req;
	},
};
