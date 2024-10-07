"use server";

import { AddUserSchema, UpdateUserSchema } from "@/schema";
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
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 404) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};

export const getUserById = async ({
	token,
	id,
}: {
	token: string;
	id: string;
}) => {
	try {
		const { data } = await axios.get(
			`http://localhost:5001/api/user/getUser/${id}`,
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
		if (e.response?.status === 401) {
			return { error: e.response.data.msg };
		} else if (e.response?.status === 404) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};

export const createUser = async ({
	token,
	userData,
	role,
}: {
	token: string;
	userData: z.infer<typeof AddUserSchema>;
	role: string;
}) => {
	const validateFields = AddUserSchema.safeParse(userData);
	if (!validateFields.success) {
		return { error: "Invalid fields!" };
	}

	try {
		const { data } = await axios.post(
			"http://localhost:5001/api/user/createUser",
			{ ...validateFields.data, role },
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

export const updateUserRole = async ({
	token,
	role,
	id,
}: {
	token: string;
	role: string;
	id: string;
}) => {
	try {
		const { data } = await axios.patch(
			`http://localhost:5001/api/user/updateUserRole/${id}`,
			{ role },
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

		return { error: "Something went wrong, try again." };
	}
};

// SUPPLIER
export const getSuppliers = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			"http://localhost:5001/api/user/getSuppliers",
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

		return { error: "Something went wrong, try again." };
	}
};

export const getSupplier = async ({
	token,
	id,
}: {
	token: string;
	id: string;
}) => {
	try {
		const { data } = await axios.get(
			`http://localhost:5001/api/user/getSupplier/${id}`,
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

// CUSTOMER
export const getCustomers = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			"http://localhost:5001/api/user/getCustomers",
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

		return { error: "Something went wrong, try again." };
	}
};

export const getCustomer = async ({
	token,
	id,
}: {
	token: string;
	id: string;
}) => {
	try {
		const { data } = await axios.get(
			`http://localhost:5001/api/user/getCustomer/${id}`,
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

// CREDITOR
export const getCreditors = async ({ token }: { token: string }) => {
	try {
		const { data } = await axios.get(
			"http://localhost:5001/api/user/getCreditors",
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

		return { error: "Something went wrong, try again." };
	}
};

export const getCreditor = async ({
	token,
	id,
}: {
	token: string;
	id: string;
}) => {
	try {
		const { data } = await axios.get(
			`http://localhost:5001/api/user/getCreditor/${id}`,
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
			return { error: "the redirect" };
		} else if (e.response?.status === 400) {
			return { error: e.response.data.msg };
		}

		return { error: "Something went wrong, try again." };
	}
};
