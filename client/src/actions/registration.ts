"use server";

import { AuthSchema } from "@/schema";
import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

export const SendOTP = async ({
	values,
	billingType,
}: {
	values: z.infer<typeof AuthSchema>;
	billingType: string;
}) => {
	const validatedFields = AuthSchema.safeParse(values);
	if (!validatedFields.success) {
		return { error: "Invalid fields!" };
	}

	try {
		const { email, password, company_name, country, payment_plan } =
			validatedFields.data;

		const { data } = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/createCompany`,
			{
				company_email: email,
				password,
				company_name,
				country,
				billingType,
				billingPlan: payment_plan,
			}
		);
		return { success: data };
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong." };
	}
};

export const ResendOTP = async ({ email }: { email: string }) => {
	try {
		const { data } = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/resendOTP`,
			{ email }
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 404) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 403) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};

export const verifyOTPToken = async ({
	email,
	otp,
}: {
	email: string;
	otp: string;
}) => {
	if (!email) {
		return { error: "Emil is required" };
	}
	if (!otp) {
		return { error: "OTP is required" };
	}

	try {
		const res = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verifyOTP`,
			{
				company_email: email,
				otp,
			}
		);
		if (res.status === 200) {
			const cookieStore = cookies();
			cookieStore.set("user", JSON.stringify(res.data.jwtToken), {
				maxAge: 60 * 60 * 24 * 7,
				httpOnly: true,
				secure: true,
			});

			cookieStore.set("role", res.data.role, {
				maxAge: 60 * 60 * 24 * 7,
				httpOnly: true,
				secure: true,
			});
		}
		return { success: res.data };
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}
		return { error: "Invalid OTP!" };
	}
};
