import jwt from "jsonwebtoken";
import UnauthenticatedError from "../errors/unauthenticated.error.mjs";

export const AuthMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer")) {
		throw new UnauthenticatedError("Invalid Authorization");
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload;
		next();
	} catch (error) {
		throw new Error("Invalid Authentication.");
	}
};
