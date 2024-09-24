"use client";

import { getSupplier } from "@/actions/user";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { CustomerTable } from "@/components/table/CustomerTable";
import { useReduxState } from "@/hook/useRedux";
import { SupplierProps } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const Supplier = ({ id }: { id: string }) => {
	const { token } = useReduxState();

	const [isPending, startTransition] = useTransition();
	const [supplier, setSupplier] = useState<SupplierProps | null>(null);

	const getSupplierData = () => {
		startTransition(async () => {
			const { data, error } = await getSupplier({ token, id });
			if (error) {
				toast.error("Error", { description: error });
			}

			setSupplier(data.supplier);
		});
	};

	useEffect(() => {
		getSupplierData();
	}, []);

	console.log({ supplier });

	return isPending ? (
		<Spinner />
	) : (
		supplier && (
			<div className="-mt-4">
				<ItemsHeader
					routeTo="/users"
					types={supplier!.supplier_name}
					productName="All Products Supplied"
				/>

				{/* <CustomerTable products={supplier!.Products} /> */}
				<p>Single Supplier</p>
			</div>
		)
	);
};
