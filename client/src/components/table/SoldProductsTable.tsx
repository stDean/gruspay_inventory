"use client";

import { useAppDispatch } from "@/app/redux";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import { ProductProps } from "@/lib/types";
import { format } from "date-fns";
import { TableContainer } from "./Table";

interface InventoryProps {
	products: ProductProps[];
	page?: number;
}

export const SoldProductsTable = ({ products, page }: InventoryProps) => {
	const { token } = useReduxState();
	const dispatch = useAppDispatch();

	const rowsPerPage = 20;
	const totalPages = Math.ceil(products.length / rowsPerPage);
	const currentPage = page || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

	const productsByPage = products.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const showProduct = async (serialNo: string) => {
		console.log("Get Sold Product");
	};

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Serial No</TableHead>
			<TableHead className="px-2 border-r">Date Sold</TableHead>
			<TableHead className="px-2 border-r">Value</TableHead>
			<TableHead className="px-2">Sold By</TableHead>
			<TableHead className="px-2">Sold To</TableHead>
			<TableHead className="px-2">Amount Sold</TableHead>
		</>
	);

	const tableBody = (
		<>
			{productsByPage.map((item, idx) => (
				<TableRow key={`${item.id}`} className="hover:!bg-none">
					<TableCell className="border-r">{idx + 1}</TableCell>
					<TableCell
						className="border-r capitalize text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer"
						onClick={() => {
							showProduct(item.serial_no);
						}}
					>
						{item.serial_no}
					</TableCell>
					<TableCell className="border-r capitalize">
						{format(item?.date_sold!, "PPP")}
					</TableCell>
					<TableCell className="border-r capitalize">{item.price}</TableCell>
					<TableCell className="border-r">
						{item.SoldByUser?.first_name
							? `${item.SoldByUser?.first_name!} ${item.SoldByUser?.last_name!}`
							: `${item.SoldByUser?.email!}`}
					</TableCell>
					<TableCell className="border-r">
						{item.Customer?.buyer_name!}
					</TableCell>
					<TableCell className="border-r">
						{item.Customer?.amount_paid!}
					</TableCell>
				</TableRow>
			))}
		</>
	);

	return (
		<TableContainer
			currentPage={currentPage}
			totalPages={totalPages}
			tableHeaders={tableHeaders}
			tableBody={tableBody}
		/>
	);
};
