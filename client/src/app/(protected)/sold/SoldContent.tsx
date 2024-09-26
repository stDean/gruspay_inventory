"use client";

import { InventorySummaryTable } from "@/components/table/InventorySummaryTable";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";
import { Tab } from "@/components/Tab";
import { useReduxState } from "@/hook/useRedux";
import { toast } from "sonner";
import {
	getSoldProductsByCount,
	getSwapProductsByCount,
} from "@/actions/sales";
import { ProductStockProps } from "@/lib/types";
import { Spinner } from "@/components/Spinners";

export const SoldContent = () => {
	const searchParam = useSearchParams();
	const { token } = useReduxState();

	const [isPending, startTransition] = useTransition();
	const [products, setProducts] = useState<{
		soldProducts: Array<ProductStockProps>;
		swappedProducts: Array<ProductStockProps>;
	}>({ soldProducts: [], swappedProducts: [] });
	const [tab, setTab] = useState<{
		sold: boolean;
		swapped: boolean;
	}>({ sold: true, swapped: false });
	const page = Number(searchParam.get("page"));

	const getProducts = useCallback(() => {
		startTransition(async () => {
			if (tab.sold) {
				const { error, data } = await getSoldProductsByCount({ token });
				if (error) {
					toast.error("Error", { description: error });
					return;
				}

				setProducts({ ...products, soldProducts: data });
				return;
			}

			if (tab.swapped) {
				const { error, data } = await getSwapProductsByCount({ token });
				if (error) {
					toast.error("Error", { description: error });
					return;
				}

				setProducts({ ...products, swappedProducts: data });
				return;
			}
		});
	}, [token, tab]);

	useEffect(() => {
		getProducts();
	}, [getProducts]);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between items-center">
				<div className="space-y-3">
					<h1 className="font-semibold text-xl md:text-2xl">Sales History</h1>

					<div className="flex text-xs bg-white text-[#344054] rounded-md border border-[#D0D5DD] cursor-pointer items-center w-fit">
						<Tab
							first
							title="Sold"
							handleTab={() => {
								setTab({ sold: true, swapped: false });
							}}
							val={tab.sold}
							styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r rounded-l-md"
						/>
						<Tab
							title="Swapped"
							handleTab={() => {
								setTab({ swapped: true, sold: false });
							}}
							val={tab.swapped}
							styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] rounded-r-md"
						/>
					</div>
				</div>
			</div>

			{tab.sold &&
				(isPending ? (
					<Spinner />
				) : products.soldProducts.length !== 0 ? (
					<InventorySummaryTable
						products={products.soldProducts}
						page={page}
						linkTo="sold"
						count="Sales"
					/>
				) : (
					<p>No Products Sold Yet!</p>
				))}

			{tab.swapped &&
				(isPending ? (
					<Spinner />
				) : products.swappedProducts.length !== 0 ? (
					<InventorySummaryTable
						products={products.swappedProducts}
						page={page}
						linkTo="sold/swap"
						count="Swap"
					/>
				) : (
					<p>No Products Swapped Yet!</p>
				))}
		</div>
	);
};
