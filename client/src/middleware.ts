import { NextRequest } from "next/server";
import { adminRoutes, authRoutes, DEFAULT_LOGIN_REDIRECT } from "@/routes";

export function middleware(request: NextRequest) {
	const { nextUrl } = request;

	const isLoggedIn = !!request.cookies.get("user")?.value;
	const role = request.cookies.get("role")?.value;

	const isAuthRoute = authRoutes.includes(nextUrl.pathname);
	const isAdminRoute = adminRoutes.includes(nextUrl.pathname);

	if (isLoggedIn) {
		if (isAuthRoute) {
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
		}

		if (isAdminRoute && role !== "ADMIN") {
			return Response.redirect(new URL("/inventory", nextUrl));
		}
	}

	if (!isLoggedIn && !isAuthRoute) {
		return Response.redirect(new URL("/", nextUrl));
	}

	return;
}

export const config = {
	// routes included in the matcher array would invoke the middleware function above
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
