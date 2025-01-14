"use client";

import useShowSoldInfoModal from "@/hook/useShowSoldDetails";
import { Modal } from "@/components/modals/Modal";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { useReduxState } from "@/hook/useRedux";
import { updateBoughtPrice } from "@/actions/inventory";
import { toast } from "sonner";

const MyInput = ({
	label,
	value,
	disabled,
	onChange,
}: {
	label: string;
	value: string;
	disabled: boolean;
	onChange?: (e: any) => void;
}) => {
	return (
		<div className="flex-1">
			<p className="text-xs">{label}</p>
			<Input value={value} disabled={disabled} onChange={onChange} />
		</div>
	);
};

export const SoldDetailModal = () => {
	const { token } = useReduxState();
	const productDetails = useShowSoldInfoModal();
	const [canUpdate, setCanUpdate] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [price, setPrice] = useState("");

	console.log({ a: productDetails.product, price });

	const handleUpdatePrice = (serialNo: string, bought_for: string) => {
		startTransition(async () => {
			const res = await updateBoughtPrice({ token, serialNo, bought_for });

			if (res?.error) {
				toast.error("Error", { description: res.error });
				return;
			}

			toast.success("Success", { description: "Price updated successfully" });
			productDetails.onClose();
			setCanUpdate(false);
		});
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Item Details</h1>
		</>
	);

	const bodyContent = (
		<>
			<div className="p-4 px-6 w-full space-y-3">
				<div className="flex items-center justify-between">
					<h1 className="text-sm font-semibold">Product Information</h1>
					<Pencil
						className="h-5 w-5 cursor-pointer text-blue-500 hover:text-blue-600"
						onClick={() => {
							setCanUpdate(true);
						}}
					/>
				</div>

				<div className="flex items-center gap-4">
					<MyInput
						label="Product Name"
						value={productDetails.product?.product_name as string}
						disabled
					/>
					<MyInput
						label="Serial Number"
						value={productDetails.product?.serial_no as string}
						disabled
					/>
				</div>
				<div className="flex items-center gap-4">
					<MyInput
						label="Product Brand"
						value={productDetails.product?.brand as string}
						disabled
					/>
					<MyInput
						label="Bought For"
						value={canUpdate ? price as string : productDetails.product?.bought_for as string}
						disabled={!canUpdate}
						onChange={e => setPrice(e.target.value)}
					/>
				</div>
			</div>

			<hr />

			<div className="p-4 px-6 w-full space-y-3">
				<h1 className="text-sm font-semibold">Supplier Information</h1>

				<div className="flex items-center gap-4 ">
					<MyInput
						label="Supplier Name"
						value={productDetails.product?.Supplier.supplier_name as string}
						disabled
					/>
					<MyInput
						label="Supplier Phone Number"
						value={productDetails.product?.Supplier.supplier_phone_no as string}
						disabled
					/>
				</div>
			</div>

			<hr />

			<div className="p-4 px-6 w-full space-y-3 mb-2">
				<h1 className="text-sm font-semibold">Customer Information</h1>

				<div className="flex items-center gap-4 ">
					<MyInput
						label="Customer Name"
						value={productDetails.product?.Customer?.buyer_name as string}
						disabled
					/>
					<MyInput
						label="Customer Number"
						value={productDetails.product?.Customer?.buyer_phone_no as string}
						disabled
					/>
				</div>
			</div>

			{canUpdate && (
				<>
					<hr />

					<div className="flex justify-end p-4 px-6">
						<Button
							onClick={() => {
								handleUpdatePrice(
									productDetails.product?.serial_no as string,
									price as string
								);
							}}
							disabled={isPending}
						>
							Update Price
						</Button>
					</div>
				</>
			)}
		</>
	);

	return (
		<Modal
			isOpen={productDetails.isOpen}
			onClose={() => {
				productDetails.onClose();
				setCanUpdate(false);
			}}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
