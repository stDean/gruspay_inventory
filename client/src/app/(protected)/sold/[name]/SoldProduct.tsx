"use client";

import { getSoldProductsByName } from "@/actions/sales";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { SoldProductsTable } from "@/components/table/SoldProductsTable";
import { useReduxState } from "@/hook/useRedux";
import { ProductProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const SoldProduct = ({ name }: { name: string }) => {
	const [products, setProducts] = useState<ProductProps[]>([]);
	const { token } = useReduxState();
	const searchParams = useSearchParams();
	const page = Number(searchParams.get("page"));
	const [isPending, startTransition] = useTransition();

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getSoldProductsByName({ name, token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}
			setProducts(data);
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
				<SoldProductsTable products={products} page={page} />
			</div>
		)
	);
};
