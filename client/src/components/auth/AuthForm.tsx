"use client";

import { Login } from "@/actions/login";
import { useAppDispatch } from "@/app/redux";
import {
	CountrySelect,
	CountrySelectValue,
} from "@/components/auth/CountrySelect";
import { CustomInput } from "@/components/auth/CustomInput";
import { CustomSelect } from "@/components/auth/CustomSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { AuthSchema } from "@/schema";
import { setLoggedInUser, setToken } from "@/state";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const PAYMENT_PLANS = ["Free", "Basic", "Standard", "Premium"];

export const AuthForm = () => {
	const dispatch = useAppDispatch();
	const pathname = usePathname();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [country, setCountry] = useState<CountrySelectValue>();
	const [show, setShow] = useState<{ password: boolean; cfPassword: boolean }>({
		password: false,
		cfPassword: false,
	});
	const [payment, setPayment] = useState<string>("Free");

	const form = useForm<z.infer<typeof AuthSchema>>({
		resolver: zodResolver(AuthSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = (data: z.infer<typeof AuthSchema>) => {
		startTransition(async () => {
			if (pathname === "/") {
				console.log("Not Here");

				const values = {
					...data,
					payment_plan: payment,
					country: country?.label,
				};
				console.log({ values });

				return;
			}

			const { error, success } = await Login({ values: data });
			if (error) {
				toast.success("Error", {
					description: error,
				});
			}
      
			if (success) {
				dispatch(setLoggedInUser(true));
				dispatch(setToken(success.user));
				toast.success("Success", {
					description: "Login successfully",
				});
				router.push("/dashboard");
			}
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div className="flex flex-col gap-4 w-[300px] md:w-[450px]">
					<p className="text-2xl font-semibold text-center">
						{pathname === "/" ? "Register" : "Log In"}
					</p>

					<CustomInput
						control={form.control}
						name="email"
						label={pathname !== "/" ? "Email" : "Company Email"}
						placeholder={
							pathname !== "/" ? "Enter email" : "Enter company email"
						}
					/>

					{pathname === "/" && (
						<>
							<CustomInput
								control={form.control}
								name="company_name"
								label="Company Name"
								placeholder="Enter company name"
							/>

							<div>
								<p className="text-sm text-gray-700 font-medium mb-1">
									Country
								</p>
								<CountrySelect
									value={country}
									onChange={value => setCountry(value as CountrySelectValue)}
								/>
							</div>

							<div className="">
								<p className="text-sm text-gray-700 font-medium mb-1">
									Select Plan
								</p>

								<CustomSelect
									label="Select Plan"
									items={
										<>
											{PAYMENT_PLANS.map(type => (
												<SelectItem
													value={type}
													key={type}
													className="capitalize"
												>
													{type}
												</SelectItem>
											))}
										</>
									}
									handleChange={(value: string) => setPayment(value)}
									value={payment}
								/>
							</div>
						</>
					)}

					<CustomInput
						control={form.control}
						name="password"
						label="Password"
						placeholder="Enter password"
						show={show.password}
						handleShow={() => setShow({ ...show, password: !show.password })}
					/>

					{pathname === "/" && (
						<>
							<CustomInput
								control={form.control}
								name="confirmPassword"
								label="Confirm Password"
								placeholder="Retype password"
								show={show.cfPassword}
								handleShow={() =>
									setShow({ ...show, cfPassword: !show.cfPassword })
								}
							/>
						</>
					)}

					<hr />

					<div className="text-end ml-auto">
						<Button disabled={isPending}>
							{pathname === "/" ? "Continue" : "Log In"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
