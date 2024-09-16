"use client";

import { getProductsByName } from "@/actions/inventory";
import { AddButton } from "@/components/AddButton";
import { ProductsTable } from "@/components/ProductsTable";
import { Spinner } from "@/components/Spinners";
import { useReduxState } from "@/hook/useRedux";
import { ProductProps } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import useAddProductModal from "@/hook/useAddProductModal";

export const SingleProductsByName = ({ name }: { name: string }) => {
	const [products, setProducts] = useState<ProductProps[]>([]);
	const { token } = useReduxState();
	const searchParams = useSearchParams();
	const page = Number(searchParams.get("page"));
	const [isPending, startTransition] = useTransition();
	const addProductsModal = useAddProductModal();

	const getProducts = useCallback(() => {
		startTransition(async () => {
			const { error, data } = await getProductsByName({ name, token });
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

	return products ? (
		<>
			{isPending ? (
				<Spinner />
			) : (
				<div className="">
					<h1 className="capitalize font-semibold text-2xl flex items-center gap-2 mb-3 -mt-4">
						<span className="text-xl">{brands}</span>
						<ChevronRight className="h-5 w-5" />
						<span className="text-xl">{types}</span>
						<ChevronRight className="h-6 w-6" />
						{productName}
					</h1>

					<ProductsTable products={products} page={page} />
				</div>
			)}
		</>
	) : (
		<AddButton
			title="No Inventory Items Yet."
			buttonText="Add Product(s)"
			handleAdd={addProductsModal.onOpen}
		/>
	);
};
