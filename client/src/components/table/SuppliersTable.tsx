"use client";

import { getSuppliers } from "@/actions/user";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import { SupplierProps } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Spinner } from "../Spinners";
import { TableContainer } from "./Table";

export const SuppliersTable = () => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [suppliers, setSuppliers] = useState<Array<SupplierProps>>([]);

	const searchParam = useSearchParams();
	const rowsPerPage = 20;
	const totalPages = Math.ceil(suppliers.length / rowsPerPage);
	const currentPage = Number(searchParam.get("page")) || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
	const [filter, setFilter] = useState<string>("");

	const suppliersByPage = suppliers.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const filterBySearch = suppliersByPage.filter(item => {
		return item.supplier_name.toLowerCase().includes(filter.toLowerCase());
	});

	const getAllSuppliers = useCallback(() => {
		startTransition(async () => {
			const res = await getSuppliers({ token });
			if ("error" in res) {
				toast.error("Error", { description: res?.error });
				return;
			}
			setSuppliers(res?.data.suppliers);
		});
	}, [token]);

	useEffect(() => {
		getAllSuppliers();
	}, [getAllSuppliers]);

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Customer Name</TableHead>
			<TableHead className="px-2 border-r">Email Address</TableHead>
			<TableHead className="px-2 border-r">Phone Number</TableHead>
			<TableHead className="px-2">Supplied Count</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{filterBySearch.map((supplier, idx) => (
				<TableRow key={supplier.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell className="px-2 border-r text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer capitalize">
						<Link href={`/users/supplier/${supplier.id}`}>
							{supplier.supplier_name}
						</Link>
					</TableCell>
					<TableCell className="px-2 border-r">
						{supplier.supplier_email}
					</TableCell>
					<TableCell className="px-2 border-r">
						{supplier.supplier_phone_no}
					</TableCell>
					<TableCell className="px-2">
						{supplier.Products.length}
					</TableCell>
				</TableRow>
			))}
		</>
	);

	return isPending ? (
		<Spinner />
	) : suppliers.length !== 0 ? (
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
		<p>No Suppliers yet</p>
	);
};
