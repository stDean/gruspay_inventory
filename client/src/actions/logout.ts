"use server";

import { cookies } from "next/headers";

export const Logout = () => {
	const cookieStore = cookies();
	cookieStore.delete("user");
	cookieStore.delete("role");
};
