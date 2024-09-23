"use client";

import { getSuppliers } from "@/actions/user";
import { useReduxState } from "@/hook/useRedux";
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "../Spinners";
import { CustomerProps, SupplierProps } from "@/lib/types";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { TableContainer } from "./Table";

export const SuppliersTable = () => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [suppliers, setSuppliers] = useState<Array<SupplierProps>>([]);

	const getAllSuppliers = () => {
		startTransition(async () => {
			const { error, data } = await getSuppliers({ token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}
			setSuppliers(data.suppliers);
		});
	};

	useEffect(() => {
		getAllSuppliers();
	}, []);

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Customer Name</TableHead>
			<TableHead className="px-2 border-r">Email Address</TableHead>
			<TableHead className="px-2 border-r">Phone Number</TableHead>
			<TableHead className="px-2 border-r">Supplied Count</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{suppliers.map((supplier, idx) => (
				<TableRow key={supplier.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell
						className="px-2 border-r text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer capitalize"
						onClick={() => {
							// TODO:Route to another page that shows all the product the user has bought
							console.log({ a: supplier.id });
						}}
					>
						{supplier.supplier_name}
					</TableCell>
					<TableCell className="px-2 border-r">
						{supplier.supplier_email}
					</TableCell>
					<TableCell className="px-2 border-r">
						{supplier.supplier_phone_no}
					</TableCell>
					<TableCell className="px-2 border-r">
						{supplier.Products.length}
					</TableCell>
				</TableRow>
			))}
		</>
	);

	return isPending ? (
		<Spinner />
	) : suppliers.length !== 0 ? (
		<TableContainer tableHeaders={tableHeaders} tableBody={bodyContent} />
	) : (
		<p>No Suppliers yet</p>
	);
};
