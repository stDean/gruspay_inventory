"use client";

import { getProduct } from "@/actions/inventory";
import { useAppDispatch } from "@/app/redux";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import useShowProductModal from "@/hook/useShowProduct";
import { ProductProps } from "@/lib/types";
import { setSingleData } from "@/state";
import { format } from "date-fns";
import { toast } from "sonner";
import { TableContainer } from "./Table";
import { useState } from "react";

interface InventoryProps {
	products: ProductProps[];
	page?: number;
}

export const ProductsTable = ({ products, page }: InventoryProps) => {
	const showProductModal = useShowProductModal();
	const { token } = useReduxState();
	const dispatch = useAppDispatch();

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

	const showProduct = async (serialNo: string) => {
		const res = await getProduct({ token, serialNo });

		if (res?.error) {
			toast.error("Error", {
				description: res?.error,
			});
			return;
		}

		dispatch(setSingleData(res?.data));
		showProductModal.onOpen({
			name: res?.data?.product_name,
			serial_no: res?.data?.serial_no,
			price: res?.data?.price,
		});
	};

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Serial No</TableHead>
			<TableHead className="px-2 border-r">Product Name</TableHead>
			<TableHead className="px-2 border-r">Specifications</TableHead>
			<TableHead className="px-2 border-r">Value(₦)</TableHead>
			<TableHead className="px-2">Supplied By</TableHead>
			<TableHead className="px-2 hidden md:block">Date Added</TableHead>
		</>
	);

	const tableBody = (
		<>
			{filterBySearch.map((item, idx) => (
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
            {item.product_name}
					</TableCell>
					<TableCell className="border-r capitalize">
						{item.description}
					</TableCell>
					<TableCell className="border-r">{item.price}</TableCell>
					<TableCell className="border-r">
						{item.Supplier.supplier_name}
					</TableCell>
          <TableCell className="border-r hidden md:block">
						{format(new Date(item.createdAt), "PPP")}
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
			search
			placeHolder="Search serial no..."
			value={filter}
			handleChange={e => setFilter(e.target.value)}
			handleClear={() => setFilter("")}
      searchInput
		/>
	);
};
