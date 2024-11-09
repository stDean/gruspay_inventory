import { ProductProps } from "@/lib/types";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { TableContainer } from "./Table";
import { format } from "date-fns";
import { useState } from "react";
import { useReduxState } from "@/hook/useRedux";

export const SupplierTable = ({
	products,
	page,
}: {
	products: ProductProps[];
	page?: number;
}) => {
	const { user } = useReduxState();
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

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Product Name</TableHead>
			<TableHead className="px-2 border-r">Serial Number</TableHead>
			{user?.role === "ADMIN" && (
				<TableHead className="px-2 border-r">Price(₦)</TableHead>
			)}
			<TableHead className="px-2 border-r">Sale Status</TableHead>
			<TableHead className="px-2 border-r">Supply Date</TableHead>
		</>
	);

	const bodyContent = (
		<>
			{filterBySearch.map((product, idx) => (
				<TableRow key={product.id}>
					<TableCell className="px-2 border-r w-5 md:w-10">{idx + 1}</TableCell>
					<TableCell className="px-2 border-r">
						{product.product_name}
					</TableCell>
					<TableCell className="px-2 border-r">{product.serial_no}</TableCell>
					{user?.role === "ADMIN" && (
						<TableCell className="px-2 border-r">{product.price}</TableCell>
					)}
					<TableCell className="px-2 border-r">
						{product?.sales_status === "SWAP"
							? "SWAPPED"
							: product?.sales_status === "NOT_SOLD"
							? "AVAILABLE"
							: product?.sales_status}
					</TableCell>
					<TableCell className="px-2 border-r">
						{format(product.createdAt, "PPP")}
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
