"use client";

import { getCreditors } from "@/actions/user";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import { CreditorProps } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { Spinner } from "../Spinners";
import { TableContainer } from "./Table";

export const CreditorsTable = () => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [creditors, setCreditors] = useState<Array<CreditorProps>>([]);

	const searchParam = useSearchParams();
	const rowsPerPage = 20;
	const totalPages = Math.ceil(creditors.length / rowsPerPage);
	const currentPage = Number(searchParam.get("page")) || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
	const [filter, setFilter] = useState<string>("");

	const creditorsByPage = creditors.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const filterBySearch = creditorsByPage.filter(item => {
		return item.creditor_name.toLowerCase().includes(filter.toLowerCase());
	});

	const getAllCreditors = useCallback(() => {
		startTransition(async () => {
			const res = await getCreditors({ token });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}
			setCreditors(res?.data.creditors);
		});
	}, [token]);

	useEffect(() => {
		getAllCreditors();
	}, [getAllCreditors]);

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Customer Name</TableHead>
			<TableHead className="px-2 border-r">Email Address</TableHead>
			<TableHead className="px-2 border-r">Phone Number</TableHead>
			<TableHead className="px-2">Bought Count</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{filterBySearch.map((creditor, idx) => (
				<TableRow key={creditor.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell className="px-2 border-r text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer capitalize">
						<Link href={`/users/creditor/${creditor.id}`}>
							{creditor.creditor_name}
						</Link>
					</TableCell>
					<TableCell className="px-2 border-r">
						{creditor.creditor_email}
					</TableCell>
					<TableCell className="px-2 border-r">
						{creditor.creditor_phone_no}
					</TableCell>
					<TableCell className="px-2">
						{creditor.Products.length}
					</TableCell>
				</TableRow>
			))}
		</>
	);

	return isPending ? (
		<Spinner />
	) : creditors.length !== 0 ? (
		<TableContainer
			tableHeaders={tableHeaders}
			tableBody={bodyContent}
			totalPages={totalPages}
			currentPage={currentPage}
			search
			placeHolder="Search name..."
			value={filter}
			handleChange={e => setFilter(e.target.value)}
			handleClear={() => setFilter("")}
      searchInput
		/>
	) : (
		<p>No Creditors yet</p>
	);
};
