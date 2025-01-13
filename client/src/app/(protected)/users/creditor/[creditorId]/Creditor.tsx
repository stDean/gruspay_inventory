"use client";

import { getCreditor } from "@/actions/user";
import { ItemsHeader } from "@/components/ItemsHeader";
import { Spinner } from "@/components/Spinners";
import { CreditorTable } from "@/components/table/CreditorTable";
import useCompletePayModal from "@/hook/useCompletePayModal";
import { useReduxState } from "@/hook/useRedux";
import { CreditorProps } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const Creditor = ({ id }: { id: string }) => {
	const router = useRouter();
	const completeModal = useCompletePayModal();
	const { token, companyDetails } = useReduxState();
	const searchParam = useSearchParams();
	const page = Number(searchParam.get("page"));

	const [isPending, startTransition] = useTransition();
	const [creditor, setCreditor] = useState<CreditorProps | null>(null);

	const getCreditorData = useCallback(() => {
		startTransition(async () => {
			const res = await getCreditor({ token, id });
			if (res?.error === "the redirect") {
				router.push("/users");
				return;
			}

			if (res?.error) {
				toast.error("Error", { description: res?.error });

				return;
			}

			setCreditor(res?.data.creditor);
		});
	}, [id, router, completeModal.isOpen]);

	useEffect(() => {
		getCreditorData();
	}, [getCreditorData]);

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
			<ItemsHeader routeTo="/users" types={creditor?.creditor_name} />

			<CreditorTable
				products={creditor?.Products}
				page={page}
				dates={creditor.subPayDates}
			/>
		</div>
	) : (
		<div>No debtors data available.</div> // Handle case where creditor is null
	);
};
