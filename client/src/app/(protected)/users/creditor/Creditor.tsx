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
	const { token } = useReduxState();
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

	return isPending ? (
		<Spinner />
	) : (
		creditor && (
			<div className="-mt-4">
				<ItemsHeader
					routeTo="/users"
					types={creditor!.creditor_name}
					productName="All Products Purchased"
				/>

				<CreditorTable products={creditor!.Products} page={page} />
			</div>
		)
	);
};
