import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const AuthMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer")) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			msg: "Invalid Authentication.",
		});
	}

	const token = authHeader.split(" ")[1];
	if (!token) return;

	const payload = jwt.verify(token, process.env.JWT_SECRET);
	req.user = payload;
	next();
};
