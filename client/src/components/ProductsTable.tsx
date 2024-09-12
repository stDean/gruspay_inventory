"use client";

import { Pagination } from "@/components/Pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ProductProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface InventoryProps {
	products: ProductProps[];
	page?: number;
}

export const ProductsTable = ({ products, page }: InventoryProps) => {
	const rowsPerPage = 20;
	const totalPages = Math.ceil(products.length / rowsPerPage);
	const currentPage = page || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

	const productsByPage = products.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	return (
		<div className="rounded-md border w-fit md:w-full shadow-md">
			<Table>
				<TableHeader className="bg-[#f3f4f4]">
					<TableRow className="font-semibold">
						<TableHead className={cn("px-2 border-r w-5 md:w-10")}>
							S/N
						</TableHead>
						<TableHead className={`px-2 border-r`}>Serial No</TableHead>
						<TableHead className="px-2 border-r">Date Added</TableHead>
						<TableHead className="px-2 border-r">Specifications</TableHead>
						<TableHead className="px-2 border-r">Value</TableHead>
						<TableHead className="px-2">Supplied By</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{productsByPage.map((item, idx) => (
						<TableRow
							key={`${item.product_name} ${idx}`}
							className="hover:!bg-none"
						>
							<TableCell className="border-r">{idx + 1}</TableCell>
							<TableCell className="border-r capitalize">
								{item.serialNo}
							</TableCell>
							<TableCell className="border-r capitalize">
								{format(item.createdAt, "PPP")}
							</TableCell>
							<TableCell className="border-r capitalize hover:underline hover:underline-offset-3 text-blue-500 hover:text-blue-400">
								{item.other_meta_data}
							</TableCell>
							<TableCell className="border-r">{item.price}</TableCell>
							<TableCell className="border-r">{item.supplier_name}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{totalPages > 1 && (
				<div className="my-4 w-full">
					<Pagination totalPages={totalPages} page={currentPage} />
				</div>
			)}
		</div>
	);
};
