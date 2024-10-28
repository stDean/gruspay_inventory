"use client";

import { getSupplier } from "@/actions/user";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { SupplierTable } from "@/components/table/SupplierTable";
import { useReduxState } from "@/hook/useRedux";
import { SupplierProps } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useCallback } from "react";
import { toast } from "sonner";

export const Supplier = ({ id }: { id: string }) => {
	const router = useRouter();
	const { token, companyDetails } = useReduxState();
	const searchParam = useSearchParams();
	const page = Number(searchParam.get("page"));

	const [isPending, startTransition] = useTransition();
	const [supplier, setSupplier] = useState<SupplierProps | null>(null);

	const getSupplierData = useCallback(() => {
		startTransition(async () => {
			const res = await getSupplier({ token, id });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}

			setSupplier(res?.data.supplier);
		});
	}, [token, id]);

	useEffect(() => {
		getSupplierData();
	}, [getSupplierData]);

	// Early redirect if the company is on the PERSONAL plan
	if (companyDetails?.billingPlan === "PERSONAL") {
		router.push("/users");
		return null; // Ensure nothing renders if the redirect happens
	}

	// Loading state
	if (isPending) return <Spinner />;

	// Render supplier details if available
	return supplier ? (
		<div className="-mt-4">
			<ItemsHeader routeTo="/users" types={supplier.supplier_name} />

			<SupplierTable products={supplier.Products || []} page={page} />
		</div>
	) : (
		<div>No supplier data available.</div> // Handle case where supplier is null
	);
};
