import { prisma } from "../utils/db.mjs";

export const AdminMiddleware = async (req, res, next) => {
	const { email } = req.user;

	const user = await prisma.users.findUnique({
		where: { email },
	});

	if (!user) {
		return res
			.status(StatusCodes.UNAUTHORIZED)
			.json({ msg: "Unauthorized", success: false });
	}

	if (user.role !== "ADMIN") {
		return res
			.status(StatusCodes.UNAUTHORIZED)
			.json({ msg: "Unauthorized", success: false });
	}

	next();
};
