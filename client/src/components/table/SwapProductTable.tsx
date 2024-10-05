"use client";

import { ProductProps } from "@/lib/types";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { TableContainer } from "./Table";
import { format } from "date-fns";
import useSwapProductDetailModal from "@/hook/useSwapProductDetailModal";
import { getProduct } from "@/actions/inventory";
import { useReduxState } from "@/hook/useRedux";
import { toast } from "sonner";

export const SwapProductTable = ({
	products,
	page,
}: {
	products: Array<ProductProps>;
	page?: number;
}) => {
	const swapProductDetails = useSwapProductDetailModal();
	const { token } = useReduxState();

	const rowsPerPage = 20;
	const totalPages = Math.ceil(products.length / rowsPerPage);
	const currentPage = page || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

	const productsByPage = products.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const handleClick = async (serialNo: string) => {
		const { data, error } = await getProduct({ serialNo, token });
		if (error) {
			toast.error("Error", { description: error });
		}

		swapProductDetails.onOpen(data);
	};

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Serial No</TableHead>
			<TableHead className="px-2 border-r">Date Swapped</TableHead>
			<TableHead className="px-2 border-r">Value(₦)</TableHead>
			<TableHead className="px-2">Swap By</TableHead>
			<TableHead className="px-2">Swap To</TableHead>
			<TableHead className="px-2">Swap Count</TableHead>
			<TableHead className="px-2">Amount Included(₦)</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{productsByPage.map((product, idx) => (
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
						{format(product.date_sold!, "PPP")}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.price}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.SoldByUser?.first_name
							? `${product.SoldByUser?.first_name!} ${product.SoldByUser
									?.last_name!}`
							: `${product.SoldByUser?.email!}`}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.Customer?.buyer_name}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.OutgoingProduct?.incomingProducts.length}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product?.bought_for}
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
		/>
	);
};
