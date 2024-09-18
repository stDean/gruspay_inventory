"use server";

import axios from "axios";

export const getSoldProductsByCount = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			"http://localhost:5001/api/inventory/getSoldProductsByCount",
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (error: any) {
		if (error.response.status === 401) {
			return { error: error.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};

export const getSoldProductsByName = async ({ token, name }: { token: string, name: string }) => {
	try {
		const { data } = await axios.get(
			`http://localhost:5001/api/inventory/getSoldProducts/${name}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (error: any) {
		if (error.response.status === 401) {
			return { error: error.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};
