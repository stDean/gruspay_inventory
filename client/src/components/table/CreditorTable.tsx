import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ProductProps } from "@/lib/types";
import { format } from "date-fns";
import { TableContainer } from "./Table";
import useCompletePayModal from "@/hook/useCompletePayModal";
import { useEffect } from "react";

export const CreditorTable = ({
	products,
	page,
}: {
	products: Array<ProductProps>;
	page: number;
}) => {
	console.log({ products });

	const completeModal = useCompletePayModal();
	const rowsPerPage = 20;
	const totalPages = Math.ceil(products.length / rowsPerPage);
	const currentPage = page || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

	const productsByPage = products.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const headerContent = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Product Name</TableHead>
			<TableHead className="px-2 border-r">Serial Number</TableHead>
			<TableHead className="px-2 border-r">Price(₦)</TableHead>
			<TableHead className="px-2 border-r">Price Paid(₦)</TableHead>
			<TableHead className="px-2 border-r">Balance Owed(₦)</TableHead>
			<TableHead className="px-2 border-r">Purchase Date</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{productsByPage.map((product, idx) => (
				<TableRow key={product.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell
						className="px-2 border-r w-5 md:w-10 text-blue-500 hover:text-blue-400 hover:underline hover:underline-offset-4 cursor-pointer capitalize"
						onClick={() => {
							completeModal.onOpen(product);
						}}
					>
						{product.product_name}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.serial_no}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.price}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.bought_for}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product?.balance_owed}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{format(product.date_sold!, "PPP")}
					</TableCell>
				</TableRow>
			))}
		</>
	);
	return (
		<TableContainer
			tableHeaders={headerContent}
			tableBody={bodyContent}
			totalPages={totalPages}
			currentPage={currentPage}
		/>
	);
};
