"use client";

import { getProduct } from "@/actions/inventory";
import { useAppDispatch } from "@/app/redux";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import useConfirmDeleteModal from "@/hook/useConfirmDelete";
import { useReduxState } from "@/hook/useRedux";
import useShowProductModal from "@/hook/useShowProduct";
import { ProductProps } from "@/lib/types";
import { setSingleData } from "@/state";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TableContainer } from "./Table";
import useUpdateItemModal from "@/hook/useUpdateItemModal";

interface InventoryProps {
	products: ProductProps[];
	page?: number;
}

export const ProductsTable = ({ products, page }: InventoryProps) => {
	const showProductModal = useShowProductModal();
	const { token, user } = useReduxState();
	const dispatch = useAppDispatch();
	const confirmDeleteModal = useConfirmDeleteModal();
	const updateItem = useUpdateItemModal();

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
			brand: res?.data?.brand,
		});
	};

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className={`px-2 border-r`}>Serial No</TableHead>
			<TableHead className="px-2 border-r">Product Name</TableHead>
			<TableHead className="px-2 border-r">Specifications</TableHead>
			{user?.role === "ADMIN" && (
				<TableHead className="px-2 border-r">Value(₦)</TableHead>
			)}
			<TableHead className="px-2 border-r">Added By</TableHead>
			<TableHead className="px-2 border-r hidden md:flex items-center">
				Status
			</TableHead>
			<TableHead className="px-2 border-r">Supplied By</TableHead>
			<TableHead className="px-2 hidden md:flex items-center border-r">
				Date Added
			</TableHead>
			{user?.role === "ADMIN" && <TableHead className="px-2">Action</TableHead>}
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
					{user?.role === "ADMIN" && (
						<TableCell className="border-r">{item.price}</TableCell>
					)}
					<TableCell className="border-r">
						{item.AddedByUser?.first_name}
					</TableCell>
					<TableCell className="border-r capitalize hidden md:block">
						{item.status.toLowerCase()}
					</TableCell>
					<TableCell className="border-r">
						{item.Supplier.supplier_name}
					</TableCell>
					<TableCell className="hidden md:block border-r">
						{format(new Date(item.createdAt), "PPP")}
					</TableCell>
					{user?.role === "ADMIN" && (
						<TableCell className="">
							<div className="flex items center gap-3 justify-center">
								<Pencil
									className="h-[17px] w-[17px] cursor-pointer hover:text-green-500 text-green-400"
									onClick={() => updateItem.onOpen(item?.serial_no)}
								/>
								<Trash2
									className="h-[17px] w-[17px] cursor-pointer hover:text-red-500 text-red-400"
									onClick={() => {
										confirmDeleteModal.onOpen(item.serial_no);
									}}
								/>
							</div>
						</TableCell>
					)}
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
