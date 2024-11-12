"use client";

import { ItemsHeader } from "@/components/ItemsHeader";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useReduxState } from "@/hook/useRedux";
import { useCallback, useEffect, useState, useTransition } from "react";
import { getSoldInvoice, resendInvoice } from "@/actions/invoice";
import { toast } from "sonner";
import { Spinner } from "@/components/Spinners";

interface ItemsProps {
	name: string;
	qty: number;
	price: number;
	totalPrice: number;
}

interface InvoiceProps {
	status: string;
	invoiceNo: string;
	balance_due: string;
	createdAt: string;
	updatedAt: string;
	customer?: {
		customerName: string;
		customerNo: string;
		customerEmail: string;
	};
	company: {
		companyName: string;
		companyEmail: string;
		companyLocation: string;
	};
	itemsPurchased: ItemsProps[];
	incomingItems: ItemsProps[];
	grandTotal: string;
}

const InvoiceTable = ({ itemsPurchased }: { itemsPurchased: ItemsProps[] }) => (
	<Table className="bg-gray-100 rounded-lg p-6 w-full">
		<TableHeader>
			<TableRow className="border-b border-gray-200 pb-4 text-sm md:text-base font-semibold">
				<TableHead className="w-1/5">Product Name</TableHead>
				<TableHead className="w-1/5">Qty</TableHead>
				<TableHead className="w-1/5">Price(₦)</TableHead>
				<TableHead className="w-1/5">Total(₦)</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{itemsPurchased.map(item => (
				<TableRow
					key={`${item.name} ${item.qty}`}
					className="border-b border-gray-200 py-4"
				>
					<TableCell className="w-1/5 font-semibold">{item.name}</TableCell>
					<TableCell className="w-1/5">{item.qty}</TableCell>
					<TableCell className="w-1/5">{item.price}</TableCell>
					<TableCell className="w-1/5">{item.totalPrice}</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export const SingleInvoice = ({ id }: { id: string }) => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [invoice, setInvoice] = useState<InvoiceProps>();
	const [pending, setPending] = useState<boolean>(false);

	const getInvoice = useCallback(() => {
		startTransition(async () => {
			const res = await getSoldInvoice({ token, invoiceNo: id });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}

			setInvoice(res?.data?.invoice);
		});
	}, [token, id]);

	const ResendInvoice = useCallback(async () => {
		setPending(true);
		const res = await resendInvoice({ token, invoiceNo: id });
		if (res?.error) {
			toast.error("Error", { description: res?.error });
			setPending(false);
			return;
		}

		toast.success("Success", { description: res?.data?.msg });
		setPending(false);
	}, [token, id]);

	useEffect(() => {
		getInvoice();
	}, [getInvoice]);

	if (isPending) {
		return <Spinner />;
	}

	if (!invoice) {
		return <p>No Invoice Found!</p>;
	}

	return (
		<div className="w-full">
			<ItemsHeader routeTo="/invoice" />

			<div className="mt-4 space-y-4 md:space-y-6">
				<div className="bg-white/80 p-4 md:p-6 flex justify-between items-center rounded-lg border-2 border-gray-300">
					<div className="flex gap-3 items-center">
						<p className="font-semibold">Status</p>

						<p
							className={cn(
								"px-2 md:px-4 py-1 md:py-2 bg-accent border text-xs lg:text-sm rounded-lg capitalize",
								{
									"text-[#B54708] bg-[#FFFAEB] border-[#FEDF89]":
										invoice?.status === "OUTSTANDING",
									"text-[#B42318] bg-[#FEF3F2] border-[#FECDCA]":
										invoice?.status === "SWAP",
									"text-[#067647] bg-[#e3faec] border-[#ABEFC6]":
										invoice?.status === "PAID",
								}
							)}
						>
							{invoice?.status.toLowerCase()}
						</p>
					</div>

					<div className="flex gap-4">
						<Button
							variant="outline"
							onClick={ResendInvoice}
							disabled={pending}
						>
							Resend Invoice
						</Button>
					</div>
				</div>

				<div className="bg-white/80 p-4 md:p-6 rounded-lg border-2 border-gray-300 space-y-6">
					<div className="flex justify-between border-b border-gray-200 pb-4">
						<div>
							<h1 className="text-lg md:text-xl font-bold">
								{invoice?.invoiceNo}
							</h1>
							<p className="font-semibold">Invoice ID</p>
						</div>

						<div className="space-y-1 font-semibold text-gray-400">
							<p>{invoice?.company?.companyName}</p>
							<p>{invoice?.company?.companyEmail}</p>
							<p>{invoice?.company?.companyLocation}.</p>
						</div>
					</div>

					<div className="flex justify-between border-b border-gray-200 pb-4">
						<div className="space-y-4">
							<div>
								<p className="font-[500] text-sm">Invoice Date</p>
								<h1 className="text-[15px] md:text-xl font-semibold">
									{format(invoice?.createdAt as string, "PPP")}
								</h1>
							</div>

							<div>
								<p className="font-[500] text-sm">Payment Date</p>
								<h1 className="text-[15px] md:text-xl font-semibold">
									{format(invoice?.updatedAt as string, "PPP")}
								</h1>
							</div>
						</div>

						<div className="font-semibold space-y-1">
							<p className="font-[500] text-sm">Bill To</p>
							<h1 className="text-base md:text-xl">
								{invoice?.customer?.customerName}
							</h1>
							<p className="text-sm md:text-base">
								{invoice?.customer?.customerNo}
							</p>
						</div>

						<div className="font-semibold space-y-1">
							<p className="font-[500] text-sm">Send To</p>
							<p className="text-sm md:text-base truncate w-[100px] md:w-full">
								{invoice?.customer?.customerEmail}
							</p>
						</div>
					</div>

					<div
						className={cn("bg-gray-100 rounded-lg p-6", {
							"space-y-2": invoice?.status === "SWAP",
						})}
					>
						{invoice?.status === "SWAP" && (
							<p className="font-semibold text-lg">Outgoing Item</p>
						)}
						{invoice?.itemsPurchased && (
							<InvoiceTable itemsPurchased={invoice.itemsPurchased} />
						)}
					</div>

					{invoice?.balance_due !== "0" && (
						<div className="rounded-lg text-lg p-6 border-2 border-red-500 flex justify-between font-semibold">
							<p>Balance Due</p>
							<p className="text-2xl">
								{formatCurrency(Number(invoice?.balance_due))}
							</p>
						</div>
					)}

					{invoice.status === "SWAP" && (
						<div className="rounded-lg p-6 border border-blue-500 flex flex-col gap-2">
							<p className="font-semibold text-lg">Incoming Item(s)</p>
							{invoice?.incomingItems && (
								<InvoiceTable itemsPurchased={invoice.incomingItems} />
							)}
						</div>
					)}

					<div className="bg-gray-300 text-lg rounded-lg p-6 flex justify-between font-semibold">
						<p>Grand Total</p>
						<p className="text-2xl">
							{formatCurrency(Number(invoice?.grandTotal))}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
