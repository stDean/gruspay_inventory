"use client";

import { getCustomers } from "@/actions/user";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import { CustomerProps } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { Spinner } from "../Spinners";
import { TableContainer } from "./Table";

export const CustomersTable = () => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [customers, setCustomers] = useState<Array<CustomerProps>>([]);

	const searchParam = useSearchParams();
	const rowsPerPage = 20;
	const totalPages = Math.ceil(customers.length / rowsPerPage);
	const currentPage = Number(searchParam.get("page")) || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
  const [filter, setFilter] = useState<string>("");

	const customersByPage = customers.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

  const filterBySearch = customersByPage.filter(item => {
		return item.buyer_name.toLowerCase().includes(filter.toLowerCase());
	});

	const getAllCustomers = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getCustomers({ token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}
			setCustomers(data.customers);
		});
	}, [token]);

	useEffect(() => {
		getAllCustomers();
	}, [getAllCustomers]);

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Customer Name</TableHead>
			<TableHead className="px-2 border-r">Email Address</TableHead>
			<TableHead className="px-2 border-r">Phone Number</TableHead>
			<TableHead className="px-2 border-r">Bought Count</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{filterBySearch.map((customer, idx) => (
				<TableRow key={customer.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell className="px-2 border-r text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer capitalize">
						<Link href={`/users/customer/${customer.id}`}>
							{customer.buyer_name}
						</Link>
					</TableCell>
					<TableCell className="px-2 border-r">
						{customer.buyer_email}
					</TableCell>
					<TableCell className="px-2 border-r">
						{customer.buyer_phone_no}
					</TableCell>
					<TableCell className="px-2 border-r">
						{customer.Products.length}
					</TableCell>
				</TableRow>
			))}
		</>
	);

	return isPending ? (
		<Spinner />
	) : customers.length !== 0 ? (
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
		/>
	) : (
		<p>No Customers yet</p>
	);
};
