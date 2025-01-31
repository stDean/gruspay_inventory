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
import { Checkbox } from "@/components/ui/checkbox";
import useShowPolicyModal from "@/hook/useShowPolicyModal";

const PAYMENT_PLANS = ["Personal", "Team", "Enterprise"];

export const AuthForm = () => {
	const showPolicy = useShowPolicyModal();
	const dispatch = useAppDispatch();
	const pathname = usePathname();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [agree, setAgree] = useState<boolean>(false);
	const [country, setCountry] = useState<CountrySelectValue>();
	const [show, setShow] = useState<{ password: boolean; cfPassword: boolean }>({
		password: false,
		cfPassword: false,
	});

	const plan =
		typeof localStorage !== "undefined" &&
		JSON.parse(localStorage.getItem("plan") as string);

	const [payment, setPayment] = useState<{ plan: string; type: string }>({
		plan: plan ? plan.plan : "Personal",
		type: plan ? plan.per : "Month",
	});

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
					country: country?.label,
					payment_plan: payment.plan.toUpperCase(),
				};

				if (!agree) {
					toast.error("Error", {
						description: "Agree to terms and conditions to continue.",
					});

					return;
				}

				if (values.password !== values.confirmPassword) {
					toast.error("Error", {
						description: "Passwords do not match",
					});

					return;
				}

				const res = await SendOTP({
					values,
					billingType: payment.type,
				});

				if (res?.error) {
					toast.error("Error", {
						description: res?.error,
					});
				}

				if (res?.success) {
					dispatch(setEmail(values.email));
					toast.success("Success", {
						description: "OTP sent successfully",
					});

					if (res?.success?.transaction) {
						router.push(res?.success?.transaction?.authorization_url);
					} else {
						router.push("/code");
					}

					form.reset();
					typeof localStorage !== "undefined" &&
						localStorage.removeItem("plan");
				}
				return;
			}

			const res = await Login({ values: data });
			if (res?.error) {
				toast.error("Error", {
					description: res?.error,
				});
				return;
			}

			if (res?.success) {
				dispatch(setLoggedInUser(true));
				dispatch(setToken(res?.success.jwtToken));

				toast.success("Success", {
					description: "Login successfully",
				});

				router.push("/dashboard");
				form.reset();
			}
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div className="flex flex-col gap-3 w-[300px] md:w-[450px]">
					<img
						src="/logo.png"
						alt="logo"
						className="w-40 md:w-52 lg:w-52 cursor-pointer mx-auto"
						onClick={() => router.push("/")}
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
								<div className="space-y-4 md:space-y-0 md:flex md:gap-4">
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
										handleChange={(value: string) =>
											setPayment({ ...payment, plan: value })
										}
										value={payment.plan}
									/>

									<CustomSelect
										label="Select Type"
										items={
											<>
												{["Month", "Year"].map(type => (
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
										handleChange={(value: string) =>
											setPayment({ ...payment, type: value })
										}
										value={payment.type}
									/>
								</div>
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
						<p className="-mt-1">
							Forgot password?{" "}
							<Link
								href="/reset"
								className="font-semibold text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer"
							>
								Reset
							</Link>
						</p>
					)}

					{pathname === "/register" && (
						<div className="items-top flex space-x-2">
							<Checkbox id="terms1" onClick={() => setAgree(!agree)} />
							<div className="grid gap-1.5 leading-none">
								<label
									// htmlFor="terms1"
									className="text-xs md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Accept{" "}
									<span
										className="font-semibold text-blue-500 hover:text-blue-600 cursor-pointer hover:underline hover:underline-offset-2"
										onClick={showPolicy.onOpen}
									>
										terms and conditions
									</span>
								</label>
								<p className="text-xs md:text-sm text-muted-foreground">
									You agree to our Terms of Service and Privacy Policy.
								</p>
							</div>
						</div>
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
