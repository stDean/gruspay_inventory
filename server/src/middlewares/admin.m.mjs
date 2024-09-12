import { prisma } from "../utils/db.mjs";
import UnauthenticatedError from "../errors/unauthenticated.error.mjs";

export const AdminMiddleware = async (req, res, next) => {
	const { email } = req.user;

	const user = await prisma.users.findUnique({
		where: { email },
	});

	if (user.role !== "ADMIN")
		throw new UnauthenticatedError("Invalid Authorization");

	next();
};
