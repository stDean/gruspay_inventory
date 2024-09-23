"use client";

import { getCustomers } from "@/actions/user";
import { useReduxState } from "@/hook/useRedux";
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "../Spinners";
import { CustomerProps } from "@/lib/types";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { TableContainer } from "./Table";

export const CustomerTable = () => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [customers, setCustomers] = useState<Array<CustomerProps>>([]);

	const getAllCustomers = () => {
		startTransition(async () => {
			const { error, data } = await getCustomers({ token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}
			setCustomers(data.customers);
		});
	};

	useEffect(() => {
		getAllCustomers();
	}, []);

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
			{customers.map((customer, idx) => (
				<TableRow key={customer.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell
						className="px-2 border-r text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer capitalize"
						onClick={() => {
							// TODO:Route to another page that shows all the product the user has bought
							console.log({ a: customer.id });
						}}
					>
						{customer.buyer_name}
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
		<TableContainer tableHeaders={tableHeaders} tableBody={bodyContent} />
	) : (
		<p>No Customers yet</p>
	);
};
