import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";

export const checkSubscriptionStatus = async (req, res, next) => {
	const { company_id } = req.user;

	const company = await prisma.company.findUnique({
		where: { id: company_id },
	});

	if (company.paymentStatus !== "ACTIVE")
		return res.status(StatusCodes.BAD_REQUEST).json({
			msg: "Action denied. Account inactive due to unpaid subscription.",
		});

	next();
};
