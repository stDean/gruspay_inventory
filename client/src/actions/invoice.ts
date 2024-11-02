import axios from "axios";

export const getSoldInvoices = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/invoice/all`,
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
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};

export const getSoldInvoice = async ({
	token,
	invoiceNo,
}: {
	token: string;
	invoiceNo: string;
}) => {
	try {
		const { data } = await axios.get(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/invoice/${invoiceNo}`,
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
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 429) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};
