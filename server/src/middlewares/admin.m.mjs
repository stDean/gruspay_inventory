import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";

export const AdminMiddleware = async (req, res, next) => {
	const { email } = req.user;

	const user = await prisma.users.findUnique({
		where: { email },
	});

	if (user.role !== "ADMIN")
		return res.status(StatusCodes.BAD_REQUEST).json({
			msg: "You are not authorized to perform this action",
		});

	next();
};
