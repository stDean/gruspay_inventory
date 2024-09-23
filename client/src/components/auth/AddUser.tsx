"use client";

import { AddUserSchema } from "@/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { CustomInput } from "@/components/auth/CustomInput";
import { CustomSelect } from "@/components/auth/CustomSelect";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";

export const AddUser = () => {
	const [password, setPassword] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [role, setRole] = useState<string>("EMPLOYEE");

	const form = useForm<z.infer<typeof AddUserSchema>>({
		resolver: zodResolver(AddUserSchema),
		defaultValues: {
			email: "",
			password: "",
			first_name: "",
			last_name: "",
		},
	});

	const handleAddUser = (data: z.infer<typeof AddUserSchema>) => {
		startTransition(() => {
			const dataToDb = { ...data, role };
			console.log(dataToDb);
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleAddUser)}>
				<div className="flex flex-col gap-4 w-full p-6">
					<CustomInput
						control={form.control}
						name="first_name"
						label="User First Name (optional)"
						placeholder="enter user first name"
					/>

					<CustomInput
						control={form.control}
						name="last_name"
						label="User Last Name (optional)"
						placeholder="enter user email"
					/>

					<CustomInput
						control={form.control}
						name="email"
						label="User Email"
						placeholder="enter user email"
					/>

					<CustomInput
						control={form.control}
						name="password"
						label="Password"
						placeholder="Enter User password"
						show={password}
						handleShow={() => setPassword(!password)}
					/>

					<CustomSelect
						label="Role"
						items={
							<>
								{["EMPLOYEE", "ADMIN"].map(type => (
									<SelectItem value={type} key={type} className="capitalize">
										{type.toLowerCase()}
									</SelectItem>
								))}
							</>
						}
						handleChange={(value: string) => setRole(value)}
						value={role}
					/>
				</div>

				<div className="border-t p-6 flex">
					<Button disabled={isPending} className="px-6 py-5 ml-auto">
						Add User
					</Button>
				</div>
			</form>
		</Form>
	);
};
