"use server";

import { UpdateUserSchema } from "@/schema";
import axios from "axios";
import { z } from "zod";

export const getUser = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get("http://localhost:5001/api/user/getUser", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { data };
	} catch (e: any) {
		if (e.response.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response.status === 404) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};

export const getUsers = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			"http://localhost:5001/api/user/getUsers",
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response.status === 404) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};

export const updateUser = async ({
	token,
	userData,
}: {
	token: string;
	userData: z.infer<typeof UpdateUserSchema>;
}) => {
	const validateFields = UpdateUserSchema.safeParse(userData);
	if (!validateFields.success) {
		return { error: "Invalid fields!" };
	}

	try {
		const { email, password, first_name, last_name } = validateFields.data;
		const { data } = await axios.patch(
			"http://localhost:5001/api/user/updateUser",
			{ email, password, first_name, last_name },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response.status === 404) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};
