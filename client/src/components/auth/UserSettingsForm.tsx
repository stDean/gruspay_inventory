"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UpdateUserSchema } from "@/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomInput } from "@/components/auth/CustomInput";
import { useReduxState } from "@/hook/useRedux";
import { updateUser } from "@/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setUser } from "@/state";
import { useAppDispatch } from "@/app/redux";

export const UserSettingsForm = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { token, user } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [show, setShow] = useState<{ password: boolean; cfPassword: boolean }>({
		password: false,
		cfPassword: false,
	});

	console.log({ user });

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
			if (userData.password && !userData.confirmPassword) {
				toast.warning("Warning", {
					description: "confirm password field cannot be empty",
				});
				return;
			}

			if (!userData.password && userData.confirmPassword) {
				toast.warning("Warning", {
					description: "password field cannot be empty",
				});
				return;
			}

			if (
				userData.password.length <= 8 ||
				userData.confirmPassword.length <= 8
			) {
				toast.warning("Warning", {
					description: "password cannot be less than 8 characters",
				});
				return;
			}

			if (userData.password !== userData.confirmPassword) {
				toast.warning("Warning", { description: "password must be equal" });
				return;
			}

			const { error, data } = await updateUser({ token, userData });

			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			toast.success("Success", {
				description: "Profile has been updated successfully",
			});
			dispatch(setUser(data.updatedUser));
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
					<h1 className="text-xl md:text-2xl font-semibold mb-2">
						Update Profile
					</h1>
					<div className="flex gap-4 items-center">
						<CustomInput
							control={form.control}
							name="first_name"
							label="First Name"
							placeholder="enter first name"
						/>

						<CustomInput
							control={form.control}
							name="last_name"
							label="Last Name"
							placeholder="enter last name"
						/>
					</div>

					<CustomInput
						control={form.control}
						name="email"
						label="Email"
						placeholder="enter your email"
					/>

					<div className="flex gap-4 items-center">
						<CustomInput
							control={form.control}
							name="password"
							label="Password"
							placeholder="enter password"
							show={show.password}
							handleShow={() => setShow({ ...show, password: !show.password })}
						/>

						<CustomInput
							control={form.control}
							name="confirmPassword"
							label="Confirm Password"
							placeholder="enter confirm password"
							show={show.cfPassword}
							handleShow={() =>
								setShow({ ...show, cfPassword: !show.cfPassword })
							}
						/>
					</div>
				</div>

				<div className="border-t p-6 flex">
					<Button disabled={isPending} className={`px-6 py-5 ml-auto`}>
						Update
					</Button>
				</div>
			</form>
		</Form>
	);
};
