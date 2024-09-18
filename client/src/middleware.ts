import { NextRequest } from "next/server";
import { authRoutes, DEFAULT_LOGIN_REDIRECT } from "@/routes";


export function middleware(request: NextRequest) {
	const { nextUrl } = request;

	const isLoggedIn = !!request.cookies.get("user")?.value;

	const isAuthRoute = authRoutes.includes(nextUrl.pathname);

	if (isLoggedIn && isAuthRoute) {
		return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
	}

	if (!isLoggedIn && !isAuthRoute) {
		return Response.redirect(new URL("/login", nextUrl));
	}

	return;
}

export const config = {
	// routes included in the matcher array would invoke the middleware function above
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
