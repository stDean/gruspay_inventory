export const AuthMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer")) {
		throw new UnauthenticatedError("Invalid Authorization");
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, process.env.JWT_ACC_SECRET);
		req.company = payload;
		next();
	} catch (error) {
		throw new Error("Invalid Authentication.");
	}
};
