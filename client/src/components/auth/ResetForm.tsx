"use client";

import { ResetOTP } from "@/actions/login";
import { CustomInput } from "@/components/auth/CustomInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ResetSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";


export const ResetForm = () => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [show, setShow] = useState<{ password: boolean; cfPassword: boolean }>({
		password: false,
		cfPassword: false,
	});

	const form = useForm<z.infer<typeof ResetSchema>>({
		resolver: zodResolver(ResetSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleSubmit = (data: z.infer<typeof ResetSchema>) => {
		startTransition(async () => {
			const { error } = await ResetOTP({ values: data });
			if (error) {
				toast.error("Error", {
					description: error,
				});
				return;
			}

			if (typeof localStorage !== "undefined") {
				localStorage.setItem(
					"user",
					JSON.stringify({
						email: data.email,
						password: data.password,
					})
				);
			}

			toast.success("Success", {
				description: "OTP sent successfully",
			});
			router.push("/update-password");
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div className="flex flex-col gap-4 w-[300px] md:w-[450px]">
					<p className="text-2xl font-semibold text-center">Reset Password</p>

					<CustomInput
						control={form.control}
						name="email"
						label="Email"
						placeholder="Enter your email"
					/>

					<CustomInput
						control={form.control}
						name="password"
						label="New Password"
						placeholder="Enter new password"
						show={show.password}
						handleShow={() => setShow({ ...show, password: !show.password })}
					/>

					<CustomInput
						control={form.control}
						name="confirmPassword"
						label="Confirm New Password"
						placeholder="Retype new password"
						show={show.cfPassword}
						handleShow={() =>
							setShow({ ...show, cfPassword: !show.cfPassword })
						}
					/>

					<hr />

					<div className="text-end ml-auto">
						<Button disabled={isPending}>Continue</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
