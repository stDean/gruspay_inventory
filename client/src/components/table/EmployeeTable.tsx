"use client";

import { useReduxState } from "@/hook/useRedux";
import { useTransition, useState, useEffect } from "react";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { getUsers } from "@/actions/user";
import { toast } from "sonner";
import { UserProps } from "@/lib/types";
import { TableContainer } from "./Table";
import { format } from "date-fns";
import { Spinner } from "../Spinners";
import useAddUserModal from "@/hook/useAddUserModal";

export const EmployeeTable = () => {
	const userModal = useAddUserModal();
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [users, setUsers] = useState<Array<UserProps>>([]);

	const getAllUsers = () => {
		startTransition(async () => {
			const { error, data } = await getUsers({ token });

			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			setUsers(data.users);
		});
	};

	useEffect(() => {
		getAllUsers();
	}, [userModal.isOpen]);

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>First Name</TableHead>
			<TableHead className="px-2 border-r">Last Name</TableHead>
			<TableHead className="px-2 border-r">Email</TableHead>
			<TableHead className="px-2 border-r">Role</TableHead>
			<TableHead className="px-2 border-r">Date Added</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{users.map((user, idx) => (
				<TableRow key={user.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell
						className="capitalize cursor-pointer px-2 border-r text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4"
						onClick={() => {
							// TODO:Show a modal of the selected user, and make it editable
							console.log({ a: user.id });
						}}
					>
						{user.first_name}
					</TableCell>
					<TableCell className="px-2 border-r capitalize">
						{user.last_name}
					</TableCell>
					<TableCell className="px-2 border-r">{user.email}</TableCell>
					<TableCell className="px-2 border-r">{user.role}</TableCell>
					<TableCell className="px-2 border-r">
						{format(user?.createdAt, "PPP")}
					</TableCell>
				</TableRow>
			))}
		</>
	);

	return isPending ? (
		<Spinner />
	) : (
		<TableContainer tableHeaders={tableHeaders} tableBody={bodyContent} />
	);
};
