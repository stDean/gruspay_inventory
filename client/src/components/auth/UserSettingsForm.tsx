"use client";

import { getUser, updateUser } from "@/actions/user";
import { useAppDispatch } from "@/app/redux";
import { CustomInput } from "@/components/auth/CustomInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useReduxState } from "@/hook/useRedux";
import { UpdateUserSchema } from "@/schema";
import { setUser } from "@/state";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const UserSettingsForm = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { token, user } = useReduxState();

	const [disabled, setDisabled] = useState(true);
	const [isPending, startTransition] = useTransition();
	const [show, setShow] = useState<{ password: boolean; cfPassword: boolean }>({
		password: false,
		cfPassword: false,
	});

	const form = useForm<z.infer<typeof UpdateUserSchema>>({
		resolver: zodResolver(UpdateUserSchema),
		defaultValues: {
			confirmPassword: "",
			password: "",
			email: user!.email,
			first_name: user!.first_name,
			last_name: user!.last_name,
		},
	});

	const handleUpdateUser = (userData: z.infer<typeof UpdateUserSchema>) => {
		startTransition(async () => {
			// If the password is provided, validate it along with confirmPassword
			if (userData.password || userData.confirmPassword) {
				if (!userData.password || !userData.confirmPassword) {
					toast.warning("Warning", {
						description: "Both password and confirm password must be provided",
					});
					return;
				}

				// Check if password and confirm password have the correct length
				if (
					userData.password.length < 8 ||
					userData.confirmPassword.length < 8
				) {
					toast.warning("Warning", {
						description: "Password must be at least 8 characters",
					});
					return;
				}

				// Check if password and confirm password match
				if (userData.password !== userData.confirmPassword) {
					toast.warning("Warning", {
						description: "Passwords must match",
					});
					return;
				}
			}

			// Proceed with updating the user even if the password is not provided
			const { error } = await updateUser({ token, userData });

			if (error) {
				toast.error("Error", {
					description: error,
				});
				return;
			}

			toast.success("Success", {
				description: "Profile has been updated successfully",
			});

			setDisabled(true);
			const { data: userDate } = await getUser({ token });
			dispatch(setUser(userDate.userInDb));
			router.refresh();
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleUpdateUser)}
				className=" w-fit md:w-[600px] border rounded-lg bg-white shadow-md"
			>
				<div className="flex flex-col gap-4 p-6 ">
					<div className="flex items-center justify-between">
						<h1 className="text-xl md:text-2xl font-semibold mb-2">
							Update Profile
						</h1>

						<Pencil
							className="cursor-pointer h-5 w-5"
							onClick={() => setDisabled(false)}
						/>
					</div>
					<div className="flex gap-4 items-center">
						<CustomInput
							control={form.control}
							name="first_name"
							label="First Name"
							placeholder="enter first name"
							disabled={disabled}
						/>

						<CustomInput
							control={form.control}
							name="last_name"
							label="Last Name"
							placeholder="enter last name"
							disabled={disabled}
						/>
					</div>

					<CustomInput
						control={form.control}
						name="email"
						label="Email"
						placeholder="enter your email"
						disabled={disabled}
					/>

					<div className="flex gap-4 items-center">
						<CustomInput
							control={form.control}
							name="password"
							label="Password"
							placeholder="enter password"
							disabled={disabled}
							show={show.password}
							handleShow={() => setShow({ ...show, password: !show.password })}
						/>

						<CustomInput
							control={form.control}
							name="confirmPassword"
							label="Confirm Password"
							placeholder="enter confirm password"
							disabled={disabled}
							show={show.cfPassword}
							handleShow={() =>
								setShow({ ...show, cfPassword: !show.cfPassword })
							}
						/>
					</div>
				</div>

				<div className="border-t p-6 flex">
					<Button
						disabled={isPending || disabled}
						className={`px-6 py-5 ml-auto`}
					>
						Update
					</Button>
				</div>
			</form>
		</Form>
	);
};
