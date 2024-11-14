"use client";

import { getProductsByName } from "@/actions/inventory";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { ProductsTable } from "@/components/table/ProductsTable";
import { useReduxState } from "@/hook/useRedux";
import useShowProductModal from "@/hook/useShowProduct";
import { ProductProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const SingleProductsByName = ({
	type,
	brand,
}: {
	type: string;
	brand: string;
}) => {
	const [products, setProducts] = useState<ProductProps[]>([]);
	const { token } = useReduxState();
	const searchParams = useSearchParams();
	const page = Number(searchParams.get("page"));
	const [isPending, startTransition] = useTransition();
	const showProductModal = useShowProductModal();

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const res = await getProductsByName({
				token,
				type,
				brand,
			});
			if ("error" in res) {
				toast.error("Error", { description: res.error });
				return;
			}
			setProducts(res?.data);
		});
	}, [showProductModal.isOpen]);

	useEffect(() => {
		getProducts();
	}, [getProducts]);

	const types = products
		.map(p => p.type)
		.filter((v, i, a) => a.indexOf(v) === i)[0];
	const brands = products
		.map(p => p.brand)
		.filter((v, i, a) => a.indexOf(v) === i)[0];

	return isPending ? (
		<Spinner />
	) : products.length !== 0 ? (
		<div className="-mt-4">
			<ItemsHeader
				addBrand
				brands={brands}
				routeTo="/inventory"
				types={types}
			/>

			<ProductsTable products={products} page={page} />
		</div>
	) : (
		<p>No Products Found</p>
	);
};
