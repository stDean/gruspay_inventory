"use server";

import axios from "axios";

export const getSoldProductsByCount = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getSoldProductsByCount`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (error: any) {
		if (error.response?.status === 401) {
			return { error: error.response.data.msg };
		} else if (error.response?.status === 400) {
			return { error: error.response.data.msg };
		}
		return { error: "Something went wrong." };
	}
};

export const getSoldProductsByName = async ({
	token,
	name,
	type,
	brand,
}: {
	token: string;
	name: string;
	type: string;
	brand: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getSoldProducts/${type}/${brand}/${name}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (error: any) {
		if (error.response?.status === 401) {
			return { error: error.response.data.msg };
		} else if (error.response?.status === 429) {
			return { error: error.response.data.msg };
		} else if (error.response?.status === 400) {
			return { error: error.response.data.msg };
		}
		return { error: "Something went wrong." };
	}
};

export const getSwapProductsByCount = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getSwapProductsByCount`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (error: any) {
		if (error.response?.status === 401) {
			return { error: error.response.data.msg };
		} else if (error.response?.status === 400) {
			return { error: error.response.data.msg };
		}
		return { error: "Something went wrong." };
	}
};

export const getSwapProductsByName = async ({
	token,
	name,
	type,
	brand,
}: {
	token: string;
	name: string;
	type: string;
	brand: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getSwapProducts/${type}/${brand}/${name}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (error: any) {
		if (error.response?.status === 401) {
			return { error: error.response.data.msg };
		} else if (error.response?.status === 429) {
			return { error: error.response.data.msg };
		} else if (error.response?.status === 400) {
			return { error: error.response.data.msg };
		}
		return { error: "Something went wrong." };
	}
};
