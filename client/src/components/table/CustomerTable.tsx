import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ProductProps } from "@/lib/types";
import { format } from "date-fns";
import { useState } from "react";
import { TableContainer } from "./Table";

export const CustomerTable = ({
	products,
	page,
}: {
	products: Array<ProductProps>;
	page: number;
}) => {
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

	const headerContent = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Product Name</TableHead>
			<TableHead className="px-2 border-r">Serial Number</TableHead>
			<TableHead className="px-2 border-r">Payment Mode</TableHead>
			<TableHead className="px-2 border-r">Price Paid(₦)</TableHead>
			<TableHead className="px-2 border-r">Balance Owed(₦)</TableHead>
			<TableHead className="px-2">Purchase Date</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{filterBySearch.map((product, idx) => (
				<TableRow key={product.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.product_name}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.serial_no}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product?.modeOfPay}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product.bought_for}
					</TableCell>
					<TableCell className="px-2 border-r w-5 md:w-10">
						{product?.balance_owed}
					</TableCell>
					<TableCell className="px-2 w-5 md:w-10">
						{format(product.date_sold as string, "PPP")}
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
			search
			placeHolder="Search serial no..."
			value={filter}
			handleChange={e => setFilter(e.target.value)}
			handleClear={() => setFilter("")}
			searchInput
		/>
	);
};
