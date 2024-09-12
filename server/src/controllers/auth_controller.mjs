import { prisma } from "../utils/db.mjs";
import { StatusCodes } from "http-status-codes";
import { generateVerificationToken } from "../utils/token.mjs";
import { hashPassword, comparePassword, createJWT } from "../utils/helper.mjs";
import { sendMail } from "../utils/sendMail.mjs";

export const AuthController = {
	sendOtp: async (req, res) => {
		const { company_name, company_email, password, country } = req.body;

		if (!company_email || !company_name || !password || !country) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "All fields are required", success: false });
		}

		const existingCompany = await prisma.company.findUnique({
			where: { company_email },
		});

		if (existingCompany?.company_email) {
			if (!existingCompany?.verified) {
				const { token, expires } = await generateVerificationToken(
					existingCompany.company_email
				);
				sendMail(existingCompany.company_email, token, "OTP Verification");
				const existingOtp = await prisma.otp.findFirst({
					where: { email: existingCompany.company_email },
				});

				if (existingOtp) {
					await prisma.otp.update({
						where: { id: existingOtp.id, email: existingOtp.email },
						data: { otp: token, expiresAt: expires },
					});
				}

				return res
					.status(StatusCodes.OK)
					.json({ message: "check your email for OTP", success: true });
			}

			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Company already exists", success: false });
		}

		const { token, expires } = await generateVerificationToken(company_email);
		const existingOtp = await prisma.otp.findFirst({
			where: { email: company_email },
		});

		if (existingOtp) {
			await prisma.otp.delete({ where: { email: company_email } });
		}
		await prisma.otp.create({
			data: { email: company_email, otp: token, expiresAt: expires },
		});

		console.log("token", token);

		// TODO:Send Token
		sendMail(company_email, token, "OTP Verification");

		// create company
		const hashedPassword = await hashPassword(password);
		const company = await prisma.company.create({
			data: { company_name, company_email, password: hashedPassword, country },
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
		const company = await prisma.company.update({
			where: { company_email: existingOtp.email },
			data: { verified: true },
		});

		console.log("company", company);

		// delete the otp
		await prisma.otp.delete({
			where: { id: existingOtp.id },
		});

		// create user
		let user;
		if (company) {
			user = await prisma.users.create({
				data: {
					companyId: company.id,
					email: company.company_email,
					password: company.password,
					role: "ADMIN",
				},
			});
		}

		const jwtToken = createJWT({
			email: user.email,
			company_id: user.companyId,
		});

		res
			.status(StatusCodes.OK)
			.json({ message: "OTP verified", success: true, jwtToken });
	},
	resendOtp: async (req, res) => {
		if (!req.body.email) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Email is required", success: false });
		}

		const existingToken = await prisma.otp.findFirst({
			where: { email: req.body.email },
		});

		const { token, expires } = await generateVerificationToken(
			existingToken.email
		);
		await prisma.otp.update({
			where: { id: existingToken.id },
			data: { otp: token, expiresAt: expires },
		});

		sendMail(existingToken.email, token, "Confirmation Code");

		console.log("token", token);

		res
			.status(StatusCodes.OK)
			.json({ message: "OTP sent to your email", success: true });
	},
	login: async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "All fields are required", success: false });
		}

		const user = await prisma.users.findUnique({
			where: { email },
		});
		if (!user) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No user with this credentials", success: false });
		}
		const passwordMatch = await comparePassword(password, user.password);
		if (!passwordMatch) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Incorrect password!", success: false });
		}

		const jwtToken = createJWT({
			email: user.email,
			company_id: user.companyId,
		});

		res
			.status(StatusCodes.OK)
			.json({ success: true, jwtToken });
	},
	otp: async (req, res) => {
		const { email, password } = req.body;
		if (!email) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Email is required", success: false });
		}

		if (!password) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Password is required", success: false });
		}

		const existingToken = await prisma.otp.findFirst({
			where: { email },
		});

		const { token, expires } = await generateVerificationToken(email);
		if (existingToken) {
			await prisma.otp.update({
				where: { id: existingToken.id },
				data: { otp: token },
			});
		}

		await prisma.otp.create({
			data: { email, otp: token, expiresAt: expires },
		});
		sendMail(email, token, "Confirmation Code");
		res
			.status(StatusCodes.OK)
			.json({ message: "OTP sent to your email", success: true, expires });
	},
	verifyAndUpdatePassword: async (req, res) => {
		const { email, otp, password } = req.body;

		const existingOtp = await prisma.otp.findFirst({
			where: { email, otp },
		});
		if (!existingOtp) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Invalid OTP", success: false });
		}
		const existingUser = await prisma.users.findUnique({
			where: { email },
		});
		if (!existingUser) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No user with this credentials", success: false });
		}

		const hashPass = await hashPassword(password);
		await prisma.users.update({
			where: { id: existingUser.id },
			data: { password: hashPass },
		});

		await prisma.otp.delete({
			where: { id: existingOtp.id },
		});

		res
			.status(StatusCodes.OK)
			.json({ message: "Password updated successfully", success: true });
	},
};
