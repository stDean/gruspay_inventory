"use server";

import { AuthSchema, ResetSchema } from "@/schema";
import { z } from "zod";
import axios from "axios";
import { cookies } from "next/headers";

export const Login = async ({
	values,
}: {
	values?: z.infer<typeof AuthSchema>;
}) => {
	const validatedFields = AuthSchema.safeParse(values);
	if (!validatedFields.success) {
		return { error: "Invalid fields!" };
	}

	try {
		const { email, password } = validatedFields.data;
		const res = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
			{
				email,
				password,
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
		} else if (e.response?.status === 500) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};

export const ResetOTP = async ({
	values,
}: {
	values: z.infer<typeof ResetSchema>;
}) => {
	const validatedFields = ResetSchema.safeParse(values);
	if (!validatedFields.success) {
		return { error: "Invalid fields!" };
	}

	try {
		const { email, password } = validatedFields.data;
		const { data } = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/resetOtp`,
			{ email, password }
		);
		return { data };
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 500) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};

export const VerifyOTPAndUpdatePass = async ({
	email,
	password,
	otp,
}: {
	email: string;
	password: string;
	otp: string;
}) => {
	try {
		const { data } = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/updatePassword`,
			{ email, password, otp }
		);
		return { success: true, data };
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 500) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};
