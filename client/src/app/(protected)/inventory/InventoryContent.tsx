"use client";

import { getProductsByStock } from "@/actions/inventory";
import { InventorySummaryTable } from "@/components/InventorySummaryTable";
import { Spinner } from "@/components/Spinners";
import { Button } from "@/components/ui/button";
import { UseReduxState } from "@/hook/useRedux";
import { ProductStockProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const InventoryContent = () => {
	const [products, setProducts] = useState<Array<ProductStockProps>>([]);
	const { token } = UseReduxState();
	const searchParam = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const page = Number(searchParam.get("page"));

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getProductsByStock({ token });
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

	return products ? (
		<>
			{isPending ? (
				<Spinner />
			) : (
				<>
					<div className="flex justify-between items-center mb-3 -mt-4">
						<h1 className="text-2xl font-semibold">Inventory</h1>
						<Button>Add Product(s)</Button>
					</div>
					<InventorySummaryTable products={products} page={page} />
				</>
			)}
		</>
	) : (
		<div>
			<p>No Product Yet</p>
		</div>
	);
};
