"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const invoiceData = [
	{
		id: 1,
		customer: "Dean",
		date: "12-10-2023",
		price: "400",
		status: "Paid",
	},
	{
		id: 2,
		customer: "Dean2",
		date: "12-10-2023",
		price: "450",
		status: "Paid",
	},
	{
		id: 3,
		customer: "Dean3",
		date: "12-10-2023",
		price: "500",
		status: "Paid",
	},
	{
		id: 4,
		customer: "Dean4",
		date: "12-10-2023",
		price: "550",
		status: "Paid",
	},
	{
		id: 5,
		customer: "Dean5",
		date: "12-10-2023",
		price: "400",
		status: "Paid",
	},
];

export const InvoiceContent = () => {
	const router = useRouter();

	return (
		<div>
			<div className="flex justify-between items-center pb-6">
				<h1 className="text-xl md:text-3xl font-semibold">Invoice(s)</h1>
				<Button>Add New</Button>
			</div>

			<div className="mx-10 space-y-5 md:text-lg">
				{invoiceData.map(item => (
					<div
						key={item.id}
						className="flex justify-between items-center py-7 px-6 bg-white/90 hover:bg-white hover:border hover:border-gray-300 rounded-lg cursor-pointer"
						onClick={() => router.push(`/invoice/${String(item.id)}`)}
					>
						<p>{item.id}</p>
						<p className="font-semibold text-center">{item.customer}</p>
						<p>{format(new Date(item.date), "P")}</p>
						<p>{item.price}</p>
						<p className="text-[#067647] bg-[#e3faec] border-[#ABEFC6] px-2 md:px-4 py-1 md:py-2 text-sm rounded-lg">
							{/* Draft Style: text-[#B54708] bg-[#FFFAEB] rounded-3xl text-sm border border-[#FEDF89] */}
							{item.status}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};
