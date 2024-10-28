"use client";

import { getUserById } from "@/actions/user";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import useModifyRoleModal from "@/hook/useUpdateRoleModal";
import { UserProps } from "@/lib/types";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "../Spinners";
import { TableContainer } from "./Table";

export const EmployeeTable = ({
	isPending,
	users,
}: {
	isPending: boolean;
	users: Array<UserProps>;
}) => {
	const modifyModal = useModifyRoleModal();

	const { token } = useReduxState();

	const searchParam = useSearchParams();
	const rowsPerPage = 20;
	const totalPages = Math.ceil(users.length / rowsPerPage);
	const currentPage = Number(searchParam.get("page")) || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

	const usersByPage = users.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const handleClick = async (id: string) => {
		const res = await getUserById({ token, id });
		if (res?.error) {
			toast.error("Error", { description: res?.error });
			return;
		}

		modifyModal.onOpen(res?.data.user);
	};

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
			{usersByPage.map((user, idx) => (
				<TableRow key={user.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell
						className="capitalize cursor-pointer px-2 border-r text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4"
						onClick={() => {
							handleClick(user.id);
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
		<TableContainer
			tableHeaders={tableHeaders}
			tableBody={bodyContent}
			totalPages={totalPages}
			currentPage={currentPage}
      
		/>
	);
};
