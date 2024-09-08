import { prisma } from "../utils/db.mjs";
import { StatusCodes } from "http-status-codes";
import { generateVerificationToken } from "../utils/token.mjs";
import { hashPassword, comparePassword, createJWT } from "../utils/helper.mjs";

export const AuthController = {
	sendOtp: async (req, res) => {
		const { company_name, company_email, password } = req.body;

		if (!company_email || !company_name || !password) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "All fields are required", success: false });
		}

		const existingCompany = await prisma.company.findUnique({
			where: { company_email },
		});

		if (existingCompany) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Company already exists", success: false });
		}

		const { token, expires } = await generateVerificationToken(company_email);
		await prisma.otp.create({
			data: { email: company_email, otp: token, expiresAt: expires },
		});

		console.log("token", token);

		// TODO:Send Token

		// create company
		const hashedPassword = await hashPassword(password);
		const company = await prisma.company.create({
			data: { company_name, company_email, password: hashedPassword },
		});

		// Store email and hashed password temporarily
		res
			.status(StatusCodes.OK)
			.json({ message: "OTP sent to your email", company, success: true });
	},
	verifyOtp: async (req, res) => {
		const { otp, company_email } = req.body;
		if (!otp) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "OTP is required", success: false });
		}

		const existingOtp = await prisma.otp.findFirst({
			where: {
				email: company_email,
				otp,
				// Ensure OTP is not expired
				expiresAt: { gte: new Date() },
				verified: false,
			},
		});

		if (!existingOtp) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Invalid OTP", success: false });
		}

		// Mark OTP as verified
		await prisma.otp.update({
			where: { id: existingOtp.id },
			data: { verified: true },
		});

		// update company verified field
		await prisma.company.update({
			where: { company_email: existingOtp.email },
			data: { verified: true },
		});

		// delete the otp
		await prisma.otp.delete({
			where: { id: existingOtp.id },
		});

		const company = await prisma.company.findUnique({
			where: { company_email: company_email },
		});
		const jwtToken = createJWT({ email: company.email, id: company.id });

		// create user
		await prisma.users.create({
			data: {
				companyId: company.id,
				email: company.company_email,
				password: company.password,
				role: "ADMIN",
			},
		});

		res
			.status(StatusCodes.OK)
			.json({ message: "OTP verified", success: true, jwtToken });
	},
	resendOtp: async (req, res) => {
		const existingToken = await prisma.otp.findFirst({
			where: { email: req.body.email },
		});

		if (!existingToken) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Invalid email", success: false });
		}

		const { token, expires } = await generateVerificationToken(
			existingToken.email
		);
		await prisma.otp.update({
			where: { id: existingToken.id },
			data: { otp: token, expiresAt: expires },
		});

		// TODO:Send Token

		console.log("token", token);

		res
			.status(StatusCodes.OK)
			.json({ message: "OTP sent to your email", success: true });
	},
	login: async (req, res) => {},
	logout: async (req, res) => {},
};
