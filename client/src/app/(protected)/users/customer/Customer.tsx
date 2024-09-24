"use client";

import { getCustomer } from "@/actions/user";
import { Spinner } from "@/components/Spinners";
import { useReduxState } from "@/hook/useRedux";
import { CustomerProps } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ItemsHeader } from "@/components/ItemsHeader";
import { CustomerTable } from "@/components/table/CustomerTable";

export const Customer = ({ id }: { id: string }) => {
	const { token } = useReduxState();

	const [isPending, startTransition] = useTransition();
	const [customer, setCustomer] = useState<CustomerProps | null>(null);

	const getCustomerData = () => {
		startTransition(async () => {
			const { data, error } = await getCustomer({ token, id });
			if (error) {
				toast.error("Error", { description: error });
			}

			setCustomer(data.customer);
		});
	};

	useEffect(() => {
		getCustomerData();
	}, []);

	return isPending ? (
		<Spinner />
	) : (
		customer && (
			<div className="-mt-4">
				<ItemsHeader
					routeTo="/users"
					types={customer!.buyer_name}
					productName="All Products Purchased"
				/>

				<CustomerTable products={customer!.Products} />
			</div>
		)
	);
};
