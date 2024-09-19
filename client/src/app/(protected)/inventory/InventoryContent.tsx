"use client";

import { getProductsByStock } from "@/actions/inventory";
import { AddButton } from "@/components/AddButton";
import { InventorySummaryTable } from "@/components/table/InventorySummaryTable";
import { Spinner } from "@/components/Spinners";
import { Button } from "@/components/ui/button";
import { useReduxState } from "@/hook/useRedux";
import { ProductStockProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import useAddProductModal from "@/hook/useAddProductModal";
import useAddSingleProductModal from "@/hook/useAddSingleProductModal";
import useAddMultipleProductModal from "@/hook/useAddMultipleProductsModal";

export const InventoryContent = () => {
	const [products, setProducts] = useState<Array<ProductStockProps>>([]);
	const { token } = useReduxState();
	const searchParam = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const page = Number(searchParam.get("page"));
	const addProductsModal = useAddProductModal();
	const addSingleProductModal = useAddSingleProductModal();
	const addMultipleProductModal = useAddMultipleProductModal();

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getProductsByStock({ token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}
			setProducts(data);
		});
	}, [token, addSingleProductModal.isOpen, addMultipleProductModal.isOpen]);

	useEffect(() => {
		getProducts();
	}, [getProducts]);

	return isPending ? (
		<Spinner />
	) : products.length === 0 ? (
		<AddButton
			title="No Inventory Items Yet."
			buttonText="Add Product(s)"
			handleAdd={addProductsModal.onOpen}
		/>
	) : (
		<>
			<div className="flex justify-between items-center mb-3 -mt-4">
				<h1 className="text-2xl font-semibold">Inventory</h1>
				<Button onClick={addProductsModal.onOpen}>Add Product(s)</Button>
			</div>
			<InventorySummaryTable
				products={products}
				page={page}
				linkTo="inventory"
				count="Stock"
			/>
		</>
	);
};
