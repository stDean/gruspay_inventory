import { z } from "zod";

export const AuthSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8, { message: "password must be at least 8 characters long." }),
	confirmPassword: z.optional(
		z
			.string()
			.min(8, { message: "password must be at least 8 characters long." })
	),
	company_name: z.string().optional(),
	payment_plan: z.string().optional(),
});
