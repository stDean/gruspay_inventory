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
import { setEmail, setLoggedInUser, setToken } from "@/state";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { SendOTP } from "@/actions/registration";
import Link from "next/link";

const PAYMENT_PLANS = ["Personal", "Team", "Enterprise"];

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

	const plan =
		typeof localStorage !== "undefined" &&
		JSON.parse(localStorage.getItem("plan")!);

	const selectedPlan = plan ? plan.plan : "Personal";
	const [payment, setPayment] = useState<string>(selectedPlan);

	const form = useForm<z.infer<typeof AuthSchema>>({
		resolver: zodResolver(AuthSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = (data: z.infer<typeof AuthSchema>) => {
		startTransition(async () => {
			if (pathname === "/register") {
				const values = {
					...data,
					payment_plan: payment.toUpperCase(),
					country: country?.label,
				};

				if (values.password !== values.confirmPassword) {
					toast.error("Error", {
						description: "Passwords do not match",
					});

					return;
				}

				const { error, success } = await SendOTP({
					values,
					billingType: plan.per,
				});

				if (error) {
					toast.error("Error", {
						description: error,
					});
				}

				if (success) {
					dispatch(setEmail(values.email));
					toast.success("Success", {
						description: "OTP sent successfully",
					});
					router.push(success.transaction.authorization_url);

					form.reset();
				}
				return;
			}

			const { error, success } = await Login({ values: data });
			if (error) {
				toast.error("Error", {
					description: error,
				});
			}

			if (success) {
				dispatch(setLoggedInUser(true));
				dispatch(setToken(success.jwtToken));

				// TODO:get user by email and dispatch the user into the state
				toast.success("Success", {
					description: "Login successfully",
				});
				router.push("/dashboard");

				typeof localStorage !== "undefined" && localStorage.removeItem("plan");
				form.reset();
			}
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div className="flex flex-col gap-4 w-[300px] md:w-[450px]">
					<img
						src="/logo.png"
						alt="logo"
						className="w-44 md:w-52 lg:w-56 cursor-pointer mx-auto"
						// onClick={() => router.push("/dashboard")}
					/>

					<p className="text-xl md:text-2xl mt-1 font-semibold">
						{pathname === "/register" ? "Register" : "Log In"}
					</p>

					<CustomInput
						control={form.control}
						name="email"
						label={pathname !== "/register" ? "Email" : "Company Email"}
						placeholder={
							pathname !== "/register" ? "Enter email" : "Enter company email"
						}
					/>

					{pathname === "/register" && (
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

					{pathname === "/register" && (
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

					{pathname === "/login" && (
						<p className="-mt-3">
							Forgot password?{" "}
							<Link
								href="/reset"
								className="font-semibold text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer"
							>
								Reset
							</Link>
						</p>
					)}

					{pathname === "/register" ? (
						<p className="text-center text-base">
							Have an account?{" "}
							<Link
								href="/login"
								className="font-semibold text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer"
							>
								Login Now
							</Link>
						</p>
					) : (
						<p className="text-center text-base">
							Don't have an account?{" "}
							<Link
								href="/register"
								className="font-semibold text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer"
							>
								Register Now
							</Link>
						</p>
					)}

					<hr />

					<div className="text-end ml-auto">
						<Button disabled={isPending}>
							{pathname === "/register" ? "Continue" : "Log In"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
