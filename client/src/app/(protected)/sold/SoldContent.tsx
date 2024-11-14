"use client";

import { getInventoryStats } from "@/actions/inventory";
import {
  getSoldProductsByCount,
  getSwapProductsByCount,
} from "@/actions/sales";
import { Spinner } from "@/components/Spinners";
import { SummaryStats } from "@/components/SummaryStats";
import { Tab } from "@/components/Tab";
import { InventorySummaryTable } from "@/components/table/InventorySummaryTable";
import { useReduxState } from "@/hook/useRedux";
import { ProductStockProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

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
	const page = Number(searchParam.get("page"));

	const getProducts = useCallback(() => {
		startTransition(async () => {
			if (tab.sold) {
				const soldRes = await getSoldProductsByCount({ token });
				if (soldRes?.error) {
					toast.error("Error", { description: soldRes?.error });
					return;
				}

				setProducts({ ...products, soldProducts: soldRes?.data });
				return;
			}

			if (tab.swapped) {
				const swapRes = await getSwapProductsByCount({ token });
				if (swapRes?.error) {
					toast.error("Error", { description: swapRes?.error });
					return;
				}

				setProducts({ ...products, swappedProducts: swapRes?.data });
				return;
			}
		});
	}, [tab]);

	const getInventoryStat = useCallback(async () => {
		const res = await getInventoryStats({ token });

		if (res?.error) {
			toast.error("Error", { description: res?.error });
			return;
		}

		if (tab.sold) {
			setStats({
				allCategory: res?.data.allCategorySold.length,
				stockCount: res?.data.totalSalesCount,
				totalPrice: res?.data.totalSoldPrice,
				topSeller: res?.data.topSoldProduct.product_name,
			});
			return;
		}

		setStats({
			allCategory: res?.data.allCategorySwap.length,
			stockCount: res?.data.totalSwapCount,
			totalPrice: res?.data.totalSwapPrice,
			topSeller: res?.data.topSoldProduct.product_name,
		});
	}, [tab]);

	useEffect(() => {
		getProducts();
	}, [getProducts]);

	useEffect(() => {
		getInventoryStat();
	}, [getInventoryStat]);

	return (
		<div className="flex flex-col gap-3 w-full">
			<div className="flex justify-between items-center w-full">
				<div className="space-y-3 w-full">
					<h1 className="font-semibold text-xl md:text-2xl">Sales History</h1>

					<SummaryStats
						title={tab.sold ? "Sales Stats" : "Swap Stats"}
						stockType={tab.sold ? "Sold" : "Swap"}
						category={stats.allCategory}
						stockCount={stats.stockCount}
						topSeller={stats.topSeller}
						totalPrice={stats.totalPrice}
						totalText={tab.sold ? "Total Sales" : "Total Amount Received"}
						addClass="flex-1 w-full"
						isPending={isPending}
					/>

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
					<p className="text-center font-semibold text-2xl mt-20">
						No Products Sold Yet!
					</p>
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
					<p className="text-center font-semibold text-2xl mt-20">
						No Products Swapped Yet!
					</p>
				))}
		</div>
	);
};
