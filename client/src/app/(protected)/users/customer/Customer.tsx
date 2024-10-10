"use client";

import { getCustomer } from "@/actions/user";
import { Spinner } from "@/components/Spinners";
import { useReduxState } from "@/hook/useRedux";
import { CustomerProps } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ItemsHeader } from "@/components/ItemsHeader";
import { CustomerTable } from "@/components/table/CustomerTable";
import { useRouter, useSearchParams } from "next/navigation";

export const Customer = ({ id }: { id: string }) => {
	const { token, companyDetails } = useReduxState();
	const router = useRouter();
	const searchParam = useSearchParams();
	const page = Number(searchParam.get("page"));

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
	}, [id]);

	// Early redirect if the company is on the PERSONAL plan
	if (companyDetails?.CompanyPayments.plan !== "ENTERPRISE") {
		router.push("/users");
		return null; // Ensure nothing renders if the redirect happens
	}

	// Loading state
	if (isPending) return <Spinner />;

	// Render supplier details if available
	return customer ? (
		<div className="-mt-4">
			<ItemsHeader
				routeTo="/users"
				types={customer!.buyer_name}
				productName="All Products Purchased"
			/>

			<CustomerTable products={customer!.Products} page={page} />
		</div>
	) : (
		<div>No customer data available.</div> // Handle case where customer is null
	);
};
