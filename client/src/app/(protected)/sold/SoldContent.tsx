"use client";

import { getSoldProductsByCount } from "@/actions/sales";
import { InventorySummaryTable } from "@/components/table/InventorySummaryTable";
import { Spinner } from "@/components/Spinners";
import { useReduxState } from "@/hook/useRedux";
import { ProductStockProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const SoldContent = () => {
	const [products, setProducts] = useState<Array<ProductStockProps>>([]);
	const { token } = useReduxState();
	const searchParam = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const page = Number(searchParam.get("page"));

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getSoldProductsByCount({ token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			setProducts(data);
		});
	}, [token]);

	useEffect(() => {
		getProducts();
	}, [getProducts]);

	console.log({ products });

	return isPending ? (
		<Spinner />
	) : products ? (
		<>
			<div className="flex justify-between items-center mb-3 -mt-4">
				<h1 className="text-2xl font-semibold">Sales History</h1>
			</div>
			<InventorySummaryTable
				products={products}
				page={page}
				linkTo="sold"
				count="Sales"
			/>
		</>
	) : (
		<div>No Product Sold Yet</div>
	);
};
