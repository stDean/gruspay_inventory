"use client";

import { sellProduct } from "@/actions/inventory";
import { useAppDispatch } from "@/app/redux";
import { CustomerInfo } from "@/components/CustomerInfo";
import { Modal } from "@/components/modals/Modal";
import { Input } from "@/components/ui/input";
import { useReduxState } from "@/hook/useRedux";
import useShowProductModal from "@/hook/useShowProduct";
import useSwapProductModal, { ItemProps } from "@/hook/useSwapModal";
import { setSingleData } from "@/state";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export const ShowProductModal = () => {
	const showProductModal = useShowProductModal();
	const swapProductModal = useSwapProductModal();

	const { singleData, token } = useReduxState();
	const dispatch = useAppDispatch();

	const [isPending, startTransition] = useTransition();
	const [sold, setSold] = useState<boolean>(false);

	const [customerInfo, setCustomerInfo] = useState<{
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
		amount_paid: string;
		balance_owed?: string;
	}>({
		buyer_name: "",
		buyer_email: "",
		phone_no: "",
		amount_paid: "",
		balance_owed: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCustomerInfo(prev => ({ ...prev, [name]: value }));
	};

	const handleClose = () => {
		showProductModal.onClose();
		dispatch(setSingleData(null));
		setSold(false);
		setCustomerInfo({
			buyer_name: "",
			buyer_email: "",
			phone_no: "",
			amount_paid: "",
			balance_owed: "",
		});
	};

	const handleSold = () => {
		if (sold) {
			startTransition(async () => {
				if (
					customerInfo.buyer_name === "" ||
					customerInfo.phone_no === "" ||
					customerInfo.amount_paid === ""
				) {
					toast.error("Error", { description: "Please fill all the fields!" });
					return;
				}

				const { error } = await sellProduct({
					token,
					serialNo: singleData!.serial_no!,
					customerInfo,
				});

				if (error) {
					toast.error("Error", { description: error });
					handleClose();
					return;
				}

				toast.success("Success", { description: "Product Sold successfully!" });
				handleClose();
			});
		}

		setSold(true);
	};

	const handleSwap = (item: ItemProps) => {
		showProductModal.onClose();
		swapProductModal.onOpen(item);
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Item Details</h1>
		</>
	);

	const bodyContent = (
		<>
			<div className="space-y-4 p-4">
				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">Type</p>
						<Input value={singleData?.type} className="capitalize" disabled />
					</div>
					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">Brand</p>
						<Input value={singleData?.brand} className="capitalize" disabled />
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">Product Name</p>
						<Input
							value={singleData?.product_name}
							className="capitalize"
							disabled
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">Price</p>
						<Input value={singleData?.price} className="capitalize" disabled />
					</div>
					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">Serial No</p>
						<Input
							value={singleData?.serial_no}
							className="capitalize"
							disabled
						/>
					</div>
				</div>
			</div>

			<hr />

			{!sold && (
				<>
					<div className="space-y-4 p-4">
						<div className="flex items-center gap-4">
							<div className="flex flex-col gap-1 flex-1">
								<p className="text-sm text-gray-500 font-semibold">
									Suppliers Full Name
								</p>
								<Input
									value={singleData?.Supplier.supplier_name}
									className="capitalize"
									disabled
								/>
							</div>

							<div className="flex flex-col gap-1 flex-1">
								<p className="text-sm text-gray-500 font-semibold">
									Suppliers Phone Number
								</p>
								<Input
									value={singleData?.Supplier.supplier_phone_no}
									className="capitalize"
									disabled
								/>
							</div>
						</div>
					</div>

					<hr />
				</>
			)}

			{sold && (
				<>
					<div className="p-4 pt-0 space-y-4">
						<CustomerInfo
							customerInfo={customerInfo}
							handleChange={handleChange}
							balance_owed
						/>
					</div>

					<hr />
				</>
			)}

			<div className="flex items-center p-6 gap-6">
				<Button
					className="w-full py-5 bg-green-500 hover:bg-green-400"
					onClick={handleSold}
					disabled={isPending}
				>
					{sold ? "Confirm Sale" : "Mark as Sold"}
				</Button>

				{!sold && (
					<Button
						className="w-full py-5"
						onClick={() =>
							handleSwap({
								product_name: singleData!.product_name!,
								serial_no: singleData!.serial_no!,
								price: singleData!.price!,
							})
						}
					>
						Swap
					</Button>
				)}
			</div>
		</>
	);

	return (
		<Modal
			isOpen={showProductModal.isOpen}
			onClose={handleClose}
			headerContent={headerContent}
			body={bodyContent}
		/>
	);
};
