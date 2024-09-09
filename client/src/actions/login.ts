"use server";

import { AuthSchema } from "@/schema";
import { z } from "zod";
import axios from "axios";
import { cookies } from "next/headers";

export const Login = async ({
	values,
}: {
	values: z.infer<typeof AuthSchema>;
}) => {
	const validatedFields = AuthSchema.safeParse(values);
	if (!validatedFields.success) {
		return { error: "Invalid fields!" };
	}

	try {
		const { email, password } = validatedFields.data;
		const res = await axios.post("http://localhost:5001/api/auth/login", {
			email,
			password,
		});
		if (res.status === 200) {
			const cookieStore = cookies();
			cookieStore.set("user", JSON.stringify(res.data.token));
		}
		return { success: res.data };
	} catch (error) {
		return { error: "Invalid credentials!" };
	}
};
