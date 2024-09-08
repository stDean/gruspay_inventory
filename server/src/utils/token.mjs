import crypto from "crypto";

export const generateVerificationToken = async email => {
	const token = crypto.randomInt(100_000, 1_000_000).toString();
	const expires = new Date(new Date().getTime() + 5 * 60 * 1000); // 5mins

	return { token, expires };
};
