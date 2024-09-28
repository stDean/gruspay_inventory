"use server";

import { AddProductSchema } from "@/schema";
import axios from "axios";
import { z } from "zod";

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
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const getProductsByName = async ({
	name,
	token,
}: {
	name: string;
	token: string;
}) => {
	const URI = `http://localhost:5001/api/inventory/getProducts/${name}`;
	try {
		const { data } = await axios.get(URI, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 404) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const addSingleProduct = async ({
	val,
	token,
}: {
	val: z.infer<typeof AddProductSchema>;
	token: string;
}) => {
	const validatedFields = AddProductSchema.safeParse(val);
	if (!validatedFields.success) {
		return { error: "Invalid fields!" };
	}

	try {
		const {
			product_name,
			brand,
			description,
			type,
			price,
			serial_no,
			supplier_name,
			supplier_phone_no,
			supplier_email,
		} = validatedFields.data;
		const { data } = await axios.post(
			"http://localhost:5001/api/inventory/createProduct",
			{
				product_name,
				brand,
				description,
				type,
				price,
				serial_no,
				supplier_name,
				supplier_phone_no,
				supplier_email,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return data;
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const addMultipleProduct = async ({
	token,
	products,
}: {
	token: string;
	products: Array<any>;
}) => {
	try {
		const { data } = await axios.post(
			"http://localhost:5001/api/inventory/createProducts",
			products,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return data;
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};

export const getProduct = async ({
	token,
	serialNo,
}: {
	token: string;
	serialNo: string;
}) => {
	try {
		const { data } = await axios.get(
			`http://localhost:5001/api/inventory/getProduct/${serialNo}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 404) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const sellProduct = async ({
	token,
	serialNo,
	customerInfo,
}: {
	token: string;
	serialNo: string;
	customerInfo: {
		buyer_name: string;
		buyer_email?: string;
		amount_paid: string;
		phone_no: string;
	};
}) => {
	try {
		const { data } = await axios.patch(
			`http://localhost:5001/api/inventory/sellProduct/${serialNo}`,
			{ ...customerInfo, buyer_phone_no: customerInfo.phone_no },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong, try again" };
	}
};

export const getAllProductsNotSold = async ({ token }: { token: string }) => {
	const { data } = await axios.get(
		"http://localhost:5001/api/inventory/getAllProducts",
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	return { data };
};

interface SwapProductsProps {
	token: string;
	customerInfo: {
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
		amount_paid: string;
	};
	outgoing: string;
	incoming: {
		product_name: string;
		type: string;
		brand: string;
		price: string;
		serial_no: string;
		description: string;
	}[];
}

export const swapProducts = async ({
	token,
	incoming,
	outgoing,
	customerInfo,
}: SwapProductsProps) => {
	try {
		const { data } = await axios.patch(
			"http://localhost:5001/api/inventory/swapProducts",
			{
				incoming,
				outgoing,
				customerInfo: {
					...customerInfo,
					buyer_phone_no: customerInfo.phone_no,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "something went wrong, try again" };
	}
};

export const getInventoryStats = async ({ token }: { token: string }) => {
	const { data } = await axios.get(
		"http://localhost:5001/api/inventory/getInventoryStats",
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	return { data };
};
