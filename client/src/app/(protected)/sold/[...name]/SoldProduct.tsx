"use client";

import { getSoldProductsByName } from "@/actions/sales";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { SoldProductsTable } from "@/components/table/SoldProductsTable";
import { useReduxState } from "@/hook/useRedux";
import useShowSoldInfoModal from "@/hook/useShowSoldDetails";
import { ProductProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const SoldProduct = ({
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
	const productDetails = useShowSoldInfoModal();

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const res = await getSoldProductsByName({ token, type, brand });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}
			setProducts(res?.data);
		});
	}, [productDetails.isOpen]);

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
			<ItemsHeader addBrand brands={brands} routeTo="/sold" types={types} />
			<SoldProductsTable products={products} page={page} />
		</div>
	) : (
		<p>No Product found</p>
	);
};
