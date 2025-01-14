"use server";

import { AddProductSchema } from "@/schema";
import axios from "axios";
import { z } from "zod";

export const getProductsByStock = async ({ token }: { token: string }) => {
	if (!token) {
		return { error: "No token provided" };
	}

	const URI = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getProductsByStock`;
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const getProductsByName = async ({
	token,
	type,
	brand,
}: {
	token: string;
	type: string;
	brand: string;
}) => {
	const URI = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getProducts/${type}/${brand}`;
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const addSingleProduct = async ({
	val,
	token,
	status,
}: {
	val: z.infer<typeof AddProductSchema>;
	token: string;
	status: string;
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
			purchaseDate,
		} = validatedFields.data;
		const { data } = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/createProduct`,
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
				status,
				purchaseDate,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 400) {
			return { error: e.response.data.msg, status: 400 };
		} else if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
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
	products: Array<unknown>;
}) => {
	try {
		const { data } = await axios.post(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/createProducts`,
			products,
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
		} else if (e.response?.status === 429) {
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
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getProduct/${serialNo}`,
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const sellProduct = async ({
	token,
	products,
	customerInfo,
	modeOfPayment,
}: {
	token: string;
	products: { amount_paid: string; serialNo: string }[];
	customerInfo: {
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
	};
	modeOfPayment: string;
}) => {
	try {
		const { data } = await axios.patch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/sellProduct`,
			{
				...customerInfo,
				buyer_phone_no: customerInfo.phone_no,
				products,
				modeOfPayment,
			},
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const sellSingleProduct = async ({
	token,
	product,
	customerInfo,
	modeOfPayment,
}: {
	token: string;
	product: { amount_paid: string; serialNo: string; balance_owed?: string };
	customerInfo: {
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
	};
	modeOfPayment: string;
}) => {
	try {
		const { data } = await axios.patch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/sellSingleProduct`,
			{
				serialNo: product.serialNo,
				amount_paid: product.amount_paid,
				buyer_name: customerInfo.buyer_name,
				buyer_email: customerInfo.buyer_email,
				buyer_phone_no: customerInfo.phone_no,
				balance_owed: product.balance_owed,
				modeOfPayment: modeOfPayment,
			},
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const getAllProductsNotSold = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getAllProducts`,
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong..." };
	}
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
	modeOfPayment: string;
}

export const swapProducts = async ({
	token,
	incoming,
	outgoing,
	customerInfo,
	modeOfPayment,
}: SwapProductsProps) => {
	try {
		const { data } = await axios.patch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/swapProducts`,
			{
				incoming,
				outgoing,
				customerInfo: {
					...customerInfo,
					buyer_phone_no: customerInfo.phone_no,
				},
				modeOfPayment,
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}

		return { error: "something went wrong, try again" };
	}
};

export const getInventoryStats = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getInventoryStats`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { data };
	} catch (e: any) {
		if (e?.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went Wrong..." };
	}
};

export const getDashboardStats = async ({
	token,
	soldYear,
	soldMonth,
	sellerMonth,
	sellerYear,
	tssYear,
	tssMonth,
}: {
	token: string;
	soldYear?: string;
	soldMonth?: string;
	sellerMonth?: string;
	sellerYear?: string;
	tssYear?: string;
	tssMonth?: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getDashboardStats?soldYear=${soldYear}&soldMonth=${soldMonth}&sellerMonth=${sellerMonth}&sellerYear=${sellerYear}&tssYear=${tssYear}&tssMonth=${tssMonth}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong..." };
	}
};

export const getTopSellerStats = async ({
	token,
	sellerMonth,
	sellerYear,
}: {
	token: string;
	sellerMonth?: string;
	sellerYear?: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getTopSeller?sellerMonth=${sellerMonth}&sellerYear=${sellerYear}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong..." };
	}
};

export const getBusSummaryStats = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getBusSummaryNLss`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong..." };
	}
};

export const getTotalSalesNPurchaseStats = async ({
	token,
	soldYear,
	soldMonth,
}: {
	token: string;
	soldYear?: string;
	soldMonth?: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getTotalSalesNPurchase?soldYear=${soldYear}&soldMonth=${soldMonth}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong..." };
	}
};

export const getTopSellingStocks = async ({
	token,
	tssYear,
	tssMonth,
}: {
	token: string;
	tssYear?: string;
	tssMonth?: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getTopSellingStocks?tssYear=${tssYear}&tssMonth=${tssMonth}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}
		return { error: "Something went wrong..." };
	}
};

export const getBarChartData = async ({
	token,
	barYear,
}: {
	token: string;
	barYear?: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/getBarChartData?barYear=${barYear}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		return { data };
	} catch (e: any) {
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong..." };
	}
};

export const updateSoldProduct = async ({
	token,
	amount,
	invoiceId,
	id,
}: {
	token: string;
	amount: string;
	id: string;
	invoiceId: string;
}) => {
	try {
		const { data } = await axios.patch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/updateBalance/${id}`,
			{ amount, invoiceId },
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
		} else if (e.response?.status === 404) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const updateBoughtPrice = async ({
	token,
	bought_for,
	serialNo,
}: {
	token: string;
	bought_for: string;
	serialNo: string;
}) => {
	try {
		const { data } = await axios.patch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/updateBoughtPrice/${serialNo}`,
			{ bought_for },
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
		} else if (e.response?.status === 404) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const deleteProduct = async ({
	token,
	serialNo,
}: {
	token: string;
	serialNo: string;
}) => {
	try {
		const { data } = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/deleteProduct/${serialNo}`,
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};

export const updateProduct = async ({
	token,
	price,
	description,
	serialNo,
}: {
	token: string;
	price: string;
	description: string;
	serialNo: string;
}) => {
	try {
		const { data } = await axios.patch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inventory/updateProduct/${serialNo}`,
			{ price, description },
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
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again" };
	}
};
