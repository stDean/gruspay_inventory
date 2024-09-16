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
	country: z.string().optional(),
});

export const ResetSchema = z
	.object({
		email: z.string().email(),
		password: z
			.string()
			.min(8, { message: "password must be at least 8 characters long." }),
		confirmPassword: z
			.string()
			.min(8, { message: "password must be at least 8 characters long." }),
	})
	.refine(
		data => {
			if (data.password && !data.confirmPassword) {
				return false;
			}

			if (!data.password && data.confirmPassword) {
				return false;
			}

			if (data.password !== data.confirmPassword) {
				return false;
			}

			return true;
		},
		{ message: "New password is required.", path: ["confirmPassword"] }
	);

export const AddProductSchema = z.object({
	product_name: z.string(),
	brand: z.string(),
	description: z.string(),
	type: z.string(),
	price: z.string(),
	serialNo: z.string(),
	supplier_name: z.string(),
	supplier_phoneNo: z.string(),
	supplier_email: z.string().optional(),
});
