"use client";

import { updateSoldProduct } from "@/actions/inventory";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCompletePayModal from "@/hook/useCompletePayModal";
import { useReduxState } from "@/hook/useRedux";
import { format } from "date-fns";
import { useCallback, useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

const MyInput = ({ label, value }: { label: string; value: string }) => {
	return (
		<div className="flex-1">
			<p className="text-xs">{label}</p>
			<Input value={value} disabled />
		</div>
	);
};

export const CompletePayModal = () => {
	const completeModal = useCompletePayModal();
	const { token } = useReduxState();
	const [amount, setAmount] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		setAmount("");
	}, [completeModal.isOpen]);

	const handlePay = useCallback(
		(id: string, amount: string, invoiceId: string) => {
			startTransition(async () => {
				const res = await updateSoldProduct({
					token,
					amount,
					id,
					invoiceId,
				});

				if (res?.error) {
					toast.error("Error", { description: res?.error });
					return;
				}

				toast.success("Success", { description: "Balance payment successful" });
				setAmount("");
				completeModal.onClose();
			});
		},
		[completeModal]
	);

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Balance Payment</h1>
		</>
	);

	const bodyContent = (
		<>
			<div className="p-4 px-6 w-full space-y-3">
				<h1 className="text-sm font-semibold">Product Information</h1>

				<div className="flex items-center gap-4">
					<MyInput
						label="Product Name"
						value={completeModal.product?.product_name as string}
					/>
					<MyInput
						label="Serial Number"
						value={completeModal.product?.serial_no as string}
					/>
				</div>
				<div className="flex items-center gap-4">
					<MyInput
						label="Product Price"
						value={completeModal.product?.price as string}
					/>
					<MyInput
						label="Amount Paid"
						value={completeModal.product?.bought_for as string}
					/>
					<MyInput
						label="Balance Owed"
						value={completeModal.product?.balance_owed as string}
					/>
				</div>
			</div>

			<hr />

			<div className="p-4 px-6 w-full space-y-3 mb-2">
				<h1 className="text-sm font-semibold">Customer Information</h1>

				<div className="flex items-center gap-4 ">
					<MyInput
						label="Customer Name"
						value={completeModal.product?.Creditor?.creditor_name as string}
					/>
					<MyInput
						label="Customer Number"
						value={completeModal.product?.Creditor?.creditor_phone_no as string}
					/>
				</div>

				<div className="flex items-center gap-3 flex-wrap">
					{[...(completeModal?.dates ?? [])]?.reverse()?.map((date, idx) => (
						<MyInput
							label={`Payment Date ${idx + 1}`}
							value={format(date.date as string, "PPP")}
						/>
					))}
				</div>
			</div>

			<hr />

			<div className="p-4 px-6 w-full space-y-3 mb-2">
				<h1 className="text-sm font-semibold">Pay Balance</h1>

				<div className="flex gap-2 flex-col">
					<p className="text-sm">Amount</p>
					<Input
						value={amount}
						name="amount"
						onChange={e => setAmount(e.target.value)}
						placeholder="Amount"
					/>
				</div>
			</div>

			<hr />

			<div className="flex items-center p-6 gap-6">
				<Button
					className="w-full py-5 bg-green-500 hover:bg-green-400"
					disabled={isPending}
					onClick={() =>
						handlePay(
							completeModal.product?.id as string,
							amount,
							completeModal.product?.invoiceId as string
						)
					}
				>
					Pay
				</Button>
			</div>
		</>
	);

	return (
		<Modal
			isOpen={completeModal.isOpen}
			onClose={completeModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
