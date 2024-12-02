"use client";

import { ProductProps } from "@/lib/types";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { TableContainer } from "./Table";
import { format } from "date-fns";
import useSwapProductDetailModal from "@/hook/useSwapProductDetailModal";
import { getProduct } from "@/actions/inventory";
import { useReduxState } from "@/hook/useRedux";
import { toast } from "sonner";
import { useState } from "react";

export const SwapProductTable = ({
	products,
	page,
}: {
	products: Array<ProductProps>;
	page?: number;
}) => {
	const swapProductDetails = useSwapProductDetailModal();
	const { token, user } = useReduxState();

	const rowsPerPage = 20;
	const totalPages = Math.ceil(products.length / rowsPerPage);
	const currentPage = page || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
	const [filter, setFilter] = useState<string>("");

	const productsByPage = products.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const filterBySearch = productsByPage.filter(item => {
		return item.serial_no.toLowerCase().includes(filter.toLowerCase());
	});

	const handleClick = async (serialNo: string) => {
		const res = await getProduct({ serialNo, token });
		if (res?.error) {
			toast.error("Error", { description: res?.error });
			return;
		}

		swapProductDetails.onOpen(res?.data);
	};

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Serial No</TableHead>
			<TableHead className="px-2 border-r">Product Name</TableHead>
			{user?.role === "ADMIN" && (
				<TableHead className="px-2 border-r">Value(₦)</TableHead>
			)}
			<TableHead className="px-2 hidden md:block">Swap By</TableHead>
			<TableHead className="px-2">Swap To</TableHead>
			<TableHead className="px-2">Swap Count</TableHead>
			<TableHead className="px-2">Amount Included(₦)</TableHead>
			<TableHead className="px-2 hidden md:flex items-center">
				Date Swapped
			</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{filterBySearch.map((product, idx) => (
				<TableRow key={product.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell
						className="px-2 border-r w-5 md:w-10 text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer"
						onClick={() => {
							handleClick(product.serial_no);
						}}
					>
						{product.serial_no}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.product_name}
					</TableCell>
					{user?.role === "ADMIN" && (
						<TableCell className="px-2 border-r w-5 md:w-10">
							{product.price}
						</TableCell>
					)}
					<TableCell className="px-2 border-r w-5 md:w-10 hidden md:block">
						{product.SoldByUser?.first_name
							? `${product.SoldByUser?.first_name}`
							: `${product.SoldByUser?.email}`}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.Customer?.buyer_name}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.OutgoingProduct?.incomingProducts.length}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.bought_for}
					</TableCell>
					<TableCell className="px-2 w-full hidden md:block">
						{format(product.date_sold as string, "PPP")}
					</TableCell>
				</TableRow>
			))}
		</>
	);
	return (
		<TableContainer
			tableHeaders={tableHeaders}
			tableBody={bodyContent}
			totalPages={totalPages}
			currentPage={currentPage}
			search
			placeHolder="Search serial no..."
			value={filter}
			handleChange={e => setFilter(e.target.value)}
			handleClear={() => setFilter("")}
			searchInput
		/>
	);
};
