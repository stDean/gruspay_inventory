"use server";

import { cookies } from "next/headers";

export const Logout = async () => {
	const cookieStore = cookies();
	cookieStore.delete("user");
};
