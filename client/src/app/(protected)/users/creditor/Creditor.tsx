"use client";

import { getCreditor } from "@/actions/user";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { CreditorTable } from "@/components/table/CreditorTable";
import useCompletePayModal from "@/hook/useCompletePayModal";
import { useReduxState } from "@/hook/useRedux";
import { CreditorProps } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const Creditor = ({ id }: { id: string }) => {
	const router = useRouter();
	const completeModal = useCompletePayModal();
	const { token, companyDetails } = useReduxState();
	const searchParam = useSearchParams();
	const page = Number(searchParam.get("page"));

	const [isPending, startTransition] = useTransition();
	const [creditor, setCreditor] = useState<CreditorProps | null>(null);

	const getCreditorData = () => {
		startTransition(async () => {
			const { data, error } = await getCreditor({ token, id });
			if (error === "the redirect") {
				router.push("/users");
				return;
			}

			if (error) {
				toast.error("Error", { description: error });

				return;
			}

			setCreditor(data.creditor);
		});
	};

	useEffect(() => {
		getCreditorData();
	}, [completeModal.isOpen]);

	// Early redirect if the company is on the PERSONAL plan
	if (companyDetails?.billingPlan !== "ENTERPRISE") {
		router.push("/users");
		return null; // Ensure nothing renders if the redirect happens
	}

	// Loading state
	if (isPending) return <Spinner />;

	// Render supplier details if available
	return creditor ? (
		<div className="-mt-4">
			<ItemsHeader
				routeTo="/users"
				types={creditor?.creditor_name}
				productName="All Products Purchased"
			/>

			<CreditorTable products={creditor?.Products} page={page} />
		</div>
	) : (
		<div>No creditor data available.</div> // Handle case where creditor is null
	);
};
