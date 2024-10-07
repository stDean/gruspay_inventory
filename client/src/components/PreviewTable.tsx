"use client";

import { addMultipleProduct } from "@/actions/inventory";
import { useAppDispatch } from "@/app/redux";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import { cn } from "@/lib/utils";
import { setPreviewProducts } from "@/state";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/Spinners";

const PreviewTableData = ({
	products,
	page,
}: {
	products: any[];
	page?: number;
}) => {
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
						<TableHead className="px-2 border-r">Product Name</TableHead>
						<TableHead className="px-2 border-r">Brand</TableHead>
						<TableHead className="px-2 border-r">Type</TableHead>
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
								{item.serial_no}
							</TableCell>
							<TableCell className="border-r capitalize">
								{item.product_name}
							</TableCell>
							<TableCell className="border-r capitalize">
								{item.brand}
							</TableCell>
							<TableCell className="border-r capitalize">{item.type}</TableCell>
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

export const PreviewTable = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();

	const { previewProducts, token } = useReduxState();
	const searchParams = useSearchParams();
	const page = Number(searchParams.get("page"));
	const [isPending, startTransition] = useTransition();

	const handleAddProducts = () => {
		startTransition(async () => {
			const { data, error } = await addMultipleProduct({
				token,
				products: previewProducts,
			});

			if (error) {
				toast.error("Error", { description: error });
				dispatch(setPreviewProducts([]));
				setTimeout(() => {
					router.push("/inventory");
				}, 300);
				return;
			}

			toast.success("Success", {
				description: "Products added successfully",
			});
			router.push("/inventory");
			dispatch(setPreviewProducts([]));
		});
	};

	const handleCancel = () => {
		router.push("/inventory");
		dispatch(setPreviewProducts([]));
	};

	return isPending ? (
		<Spinner />
	) : (
		<div className="flex flex-col justify-between items-center mb-3 -mt-4">
			<div className="flex justify-between items-center w-full mb-4">
				<h1 className="text-2xl font-semibold">Preview Inventory</h1>
				<div className="flex gap-4">
					<Button
						onClick={handleCancel}
						className="bg-red-500 hover:bg-red-400"
					>
						Cancel
					</Button>
					<Button onClick={handleAddProducts}>Add Product(s)</Button>
				</div>
			</div>
			<PreviewTableData products={previewProducts} page={page} />
		</div>
	);
};
