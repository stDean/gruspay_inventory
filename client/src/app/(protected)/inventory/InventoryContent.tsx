"use client";

import { getProductsByStock, getInventoryStats } from "@/actions/inventory";
import { AddButton } from "@/components/AddButton";
import { Spinner } from "@/components/Spinners";
import { SummaryStats } from "@/components/SummaryStats";
import { InventorySummaryTable } from "@/components/table/InventorySummaryTable";
import { Button } from "@/components/ui/button";
import useAddMultipleProductModal from "@/hook/useAddMultipleProductsModal";
import useAddProductModal from "@/hook/useAddProductModal";
import useAddSingleProductModal from "@/hook/useAddSingleProductModal";
import { useReduxState } from "@/hook/useRedux";
import { ProductStockProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const InventoryContent = () => {
	const [products, setProducts] = useState<Array<ProductStockProps>>([]);
	const { token } = useReduxState();
	const searchParam = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const page = Number(searchParam.get("page"));
	const addProductsModal = useAddProductModal();
	const addSingleProductModal = useAddSingleProductModal();
	const addMultipleProductModal = useAddMultipleProductModal();

	const [stats, setStats] = useState<{
		allCategory: number;
		stockCount: number;
		totalPrice: number;
		topSeller: string;
	}>({
		allCategory: 0,
		stockCount: 0,
		totalPrice: 0,
		topSeller: "No Sales Yet",
	});

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getProductsByStock({ token });
			console.log({ error });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}
			setProducts(data);
		});
	}, [token, addSingleProductModal.isOpen, addMultipleProductModal.isOpen]);

	const getInventoryStat = async () => {
		const { data } = await getInventoryStats({ token });
		setStats({
			allCategory: data.allCategoryNotSold.length,
			stockCount: data.totalInventoryCount,
			totalPrice: data.totalPrice,
			topSeller: data.topSoldProduct.product_name,
		});
	};

	useEffect(() => {
		getProducts();
		getInventoryStat();
	}, [getProducts]);

	console.log({ stats });

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

			<SummaryStats
				title="Overall Inventory"
				stockType="Count"
				category={stats.allCategory}
				stockCount={stats.stockCount}
				topSeller={stats.topSeller}
				totalPrice={stats.totalPrice}
				totalText="Inventory Value"
			/>

			<InventorySummaryTable
				products={products}
				page={page}
				linkTo="inventory"
				count="Stock"
			/>
		</>
	);
};
