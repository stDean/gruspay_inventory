"use client";

import { getSwapProductsByName } from "@/actions/sales";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { SwapProductTable } from "@/components/table/SwapProductTable";
import { useReduxState } from "@/hook/useRedux";
import { ProductProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { toast } from "sonner";

export const SwapProduct = ({ name }: { name: string }) => {
	const [products, setProducts] = useState<ProductProps[]>([]);
	const { token } = useReduxState();
	const searchParams = useSearchParams();
	const page = Number(searchParams.get("page"));
	const [isPending, startTransition] = useTransition();

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getSwapProductsByName({ name, token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}
			setProducts(data.swapProducts);
		});
	}, [token, name]);

	useEffect(() => {
		getProducts();
	}, [getProducts]);

	const types = products
		.map(p => p.type)
		.filter((v, i, a) => a.indexOf(v) === i)[0];
	const brands = products
		.map(p => p.brand)
		.filter((v, i, a) => a.indexOf(v) === i)[0];

	const productName = name.replace(/%20/g, " ");

	console.log({ products });

	return isPending ? (
		<Spinner />
	) : (
		products && (
			<div className="-mt-4">
				<ItemsHeader
					addBrand
					brands={brands}
					routeTo="/sold"
					types={types}
					productName={productName}
				/>

				<SwapProductTable products={products} page={page} />
			</div>
		)
	);
};
