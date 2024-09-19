"use client";

import { getSoldProductsByName } from "@/actions/sales";
import { Spinner } from "@/components/Spinners";
import { SoldProductsTable } from "@/components/table/SoldProductsTable";
import { useReduxState } from "@/hook/useRedux";
import { ProductProps } from "@/lib/types";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const SoldProduct = ({ name }: { name: string }) => {
	const [products, setProducts] = useState<ProductProps[]>([]);
	const { token } = useReduxState();
	const searchParams = useSearchParams();
	const page = Number(searchParams.get("page"));
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

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
				<p
					className="flex items-center gap-1 border rounded-2xl w-fit p-1 px-3 justify-center border-blue-500 text-blue-500 hover:border-blue-400 cursor-pointer hover:text-blue-400 mb-3"
					onClick={() => {
						router.push("/sold");
					}}
				>
					<ArrowLeft className="h-4 w-4" /> Back
				</p>
				<h1 className="capitalize font-semibold text-2xl flex items-center gap-2 mb-3">
					<span className="text-xl">{brands}</span>
					<ChevronRight className="h-5 w-5" />
					<span className="text-xl">{types}</span>
					<ChevronRight className="h-6 w-6" />
					{productName}
				</h1>

				<SoldProductsTable products={products} page={page} />
			</div>
		)
	);
};
