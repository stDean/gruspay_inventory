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
			serialNo,
			supplier_name,
			supplier_phoneNo,
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
				serialNo,
				supplier_name,
				supplierPhoneNo: supplier_phoneNo,
				supplierEmail: supplier_email,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return data;
	} catch (e: any) {
		if (e.response.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong." };
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
		console.log(e.response);
		if (e.response.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong." };
	}
};
