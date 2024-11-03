"use client";

import { getSoldInvoices } from "@/actions/invoice";
import { Spinner } from "@/components/Spinners";
// import { Button } from "@/components/ui/button";
import { useReduxState } from "@/hook/useRedux";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const InvoiceContent = () => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { token } = useReduxState();
	const [allSoldInvoices, setAllSoldInvoices] = useState<
		{
			id: string;
			customer: string;
			date: string;
			status: string;
			price: string;
		}[]
	>();

	const getAllSoldInvoices = useCallback(() => {
		startTransition(async () => {
			const res = await getSoldInvoices({ token });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}

			setAllSoldInvoices(res?.data?.invoices);
		});
	}, [token]);

	useEffect(() => {
		getAllSoldInvoices();
	}, [getAllSoldInvoices]);

	return (
		<div>
			<div className="flex justify-between items-center pb-6">
				<h1 className="text-xl md:text-3xl font-semibold">Invoice(s)</h1>
				{/* <Button>Add New</Button> */}
			</div>

			{isPending ? (
				<Spinner />
			) : allSoldInvoices?.length === 0 ? (
				<div className="text-center">
					<h1 className="text-xl font-semibold">No invoice(s) found</h1>
				</div>
			) : (
				<div className="lg:mx-10 space-y-5 md:text-lg">
					{allSoldInvoices?.map(item => (
						<div
							key={item.id}
							className="flex justify-between items-center py-7 lg:px-6 px-2 bg-white/90 hover:bg-white hover:border hover:border-gray-300 rounded-lg cursor-pointer"
							onClick={() => router.push(`/invoice/${String(item.id)}`)}
						>
							<p className="w-fit">{item.id}</p>
							<p className="font-semibold w-fit text-center">{item.customer}</p>
							<p className="w-fit text-center">
								{format(new Date(item.date), "P")}
							</p>
							<p className="w-fit text-center">{item.price}</p>
							<p
								className={cn(
									"px-2 md:px-4 py-1 md:py-2 bg-accent border text-xs lg:text-sm rounded-lg capitalize",
									{
										"text-[#B54708] bg-[#FFFAEB] border-[#FEDF89]":
											item.status === "Outstanding",
										"text-[#B42318] bg-[#FEF3F2] border-[#FECDCA]":
											item.status === "Swap",
										"text-[#067647] bg-[#e3faec] border-[#ABEFC6]":
											item.status === "Paid",
									}
								)}
							>
								{item.status}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
