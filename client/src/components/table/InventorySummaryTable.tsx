"use client";

import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ProductStockProps } from "@/lib/types";
import Link from "next/link";
import { TableContainer } from "./Table";

interface InventoryProps {
	products: ProductStockProps[];
	page?: number;
	linkTo: string;
	count: string;
}

export const InventorySummaryTable = ({
	products,
	page,
	count,
	linkTo,
}: InventoryProps) => {
	const rowsPerPage = 20;
	const totalPages = Math.ceil(products.length / rowsPerPage);
	const currentPage = page || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

	const productsByPage = products.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className="px-2 border-r w-36">Type</TableHead>
			<TableHead className="px-2 border-r w-36">Brand</TableHead>
			<TableHead className="px-2 border-r w-36">Product Name</TableHead>
			<TableHead className="px-2 w-28">{count} Count</TableHead>
		</>
	);

	const tableBody = (
		<>
			{productsByPage.map((item, idx) => (
				<TableRow key={item.product_name} className="hover:!bg-none">
					<TableCell className="border-r">{idx + 1}</TableCell>
					<TableCell className="border-r capitalize">{item.type}</TableCell>
					<TableCell className="border-r capitalize">{item.brand}</TableCell>
					<TableCell className="border-r capitalize hover:underline hover:underline-offset-3 text-blue-500 hover:text-blue-400">
						<Link href={`/${linkTo}/${item.product_name}`}>
							{item.product_name}
						</Link>
					</TableCell>
					<TableCell className="border-r">{item._count["type"]}</TableCell>
				</TableRow>
			))}
		</>
	);

	return (
		<TableContainer
			totalPages={totalPages}
			currentPage={currentPage}
			tableHeaders={tableHeaders}
			tableBody={tableBody}
		/>
	);
};
