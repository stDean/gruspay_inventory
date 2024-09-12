"use server";

import axios from "axios";

export const getProductsByStock = async ({ token }: { token: string }) => {
	if (!token) {
		return { error: "No token provided" };
	}

	const URI = "http://localhost:5001/api/inventory/getProductsByStock";
	try {
		const { data } = await axios.get(URI, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { data };
	} catch (e: any) {
		if (e.response.status === 401) {
			return { error: e.response.data.msg };
		}
		return { error: "Invalid token" };
	}
};

export const getProductsByName = async ({
	name,
	token,
}: {
	name: string;
	token: string;
}) => {
	if (!token) {
		return { error: "No token provided" };
	}

	const URI = `http://localhost:5001/api/inventory/getProducts/${name}`;
	try {
		const { data } = await axios.get(URI, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { data };
	} catch (e: any) {
		if (e.response.status === 401) {
			return { error: e.response.data.msg };
		}
		return { error: "Invalid token" };
	}
};
