"use client";

import { getProductsByStock, getInventoryStats } from "@/actions/inventory";
import { getUser } from "@/actions/user";
import { useAppDispatch } from "@/app/redux";
import { AddButton } from "@/components/AddButton";
import { Spinner } from "@/components/Spinners";
import { SummaryStats } from "@/components/SummaryStats";
import { InventorySummaryTable } from "@/components/table/InventorySummaryTable";
import { Button } from "@/components/ui/button";
import useAddMultipleProductModal from "@/hook/useAddMultipleProductsModal";
import useAddProductModal from "@/hook/useAddProductModal";
import useAddSingleProductModal from "@/hook/useAddSingleProductModal";
import { useReduxState } from "@/hook/useRedux";
import useShowProductModal from "@/hook/useShowProduct";
import { ProductStockProps } from "@/lib/types";
import { setUser } from "@/state";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const InventoryContent = () => {
	const [products, setProducts] = useState<Array<ProductStockProps>>([]);
	const { token, companyDetails, user } = useReduxState();
	const searchParam = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const page = Number(searchParam.get("page"));
	const addProductsModal = useAddProductModal();
	const addSingleProductModal = useAddSingleProductModal();
	const addMultipleProductModal = useAddMultipleProductModal();
	const showProductModal = useShowProductModal();
	const dispatch = useAppDispatch();

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
			const res = await getProductsByStock({ token });
			if ("error" in res) {
				toast.error("Error", { description: res.error });
				return;
			}
			setProducts(res?.data);
		});
	}, [token, addSingleProductModal.isOpen, addMultipleProductModal.isOpen]);

	const setUserState = useCallback(async () => {
		const res = await getUser({ token });
		if (res?.error) {
			toast.error("Error", { description: res?.error });
			return;
		}

		dispatch(setUser(res?.data.userInDb));
	}, [token, user]);

	const getInventoryStat = async () => {
		const res = await getInventoryStats({ token });
		if (res?.error) {
			toast.error("Error", { description: res?.error });

			setStats({
				allCategory: 0,
				stockCount: 0,
				totalPrice: 0,
				topSeller: "No Sales Yet",
			});
			return;
		}

		setStats({
			allCategory: res?.data.allCategoryNotSold.length,
			stockCount: res?.data.totalInventoryCount,
			totalPrice: res?.data.totalPrice,
			topSeller: res?.data.topSoldProduct.product_name,
		});
	};

	useEffect(() => {
		getProducts();
		getInventoryStat();
	}, [getProducts]);

	useEffect(() => {
		setUserState();
	}, []);

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
				{companyDetails?.paymentStatus === "ACTIVE" && (
					<div className="flex flex-col gap-4 md:flex-row">
						<Button onClick={() => showProductModal.onOpen(null)} variant="outline">
							Sell Product(s)
						</Button>
						<Button
							onClick={addProductsModal.onOpen}
							className="hover:opacity-90"
						>
							Add Product(s)
						</Button>
					</div>
				)}
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
