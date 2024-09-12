"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ProductStockProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";

interface InventoryProps {
	products: ProductStockProps[];
	page?: number;
}

export const InventorySummaryTable = ({ products, page }: InventoryProps) => {
	const rowsPerPage = 15;
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
					<TableRow className="">
						<TableHead className={cn("px-2 border-r w-5 md:w-10")}>
							S/N
						</TableHead>
						<TableHead className="px-2 border-r w-36">Type</TableHead>
						<TableHead className="px-2 border-r w-36">Brand</TableHead>
						<TableHead className="px-2 border-r w-36">Name</TableHead>
						<TableHead className="px-2 w-28">Stock Count</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{productsByPage.map((item, idx) => (
						<TableRow key={item.product_name} className="hover:!bg-none">
							<TableCell className="border-r">{idx + 1}</TableCell>
							<TableCell className="border-r capitalize">{item.type}</TableCell>
							<TableCell className="border-r capitalize">
								{item.brand}
							</TableCell>
							<TableCell className="border-r capitalize hover:underline hover:underline-offset-3 text-blue-500 hover:text-blue-400">
								<Link href={`/inventory/${item.product_name}`}>
									{item.product_name}
								</Link>
							</TableCell>
							<TableCell className="border-r">{item._count["type"]}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{totalPages > 1 && (
				<div className=" w-full border-t">
					<Pagination totalPages={totalPages} page={currentPage} />
				</div>
			)}
		</div>
	);
};
