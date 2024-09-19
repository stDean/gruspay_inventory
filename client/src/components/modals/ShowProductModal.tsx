"use client";

import useShowProductModal from "@/hook/useShowProduct";
import { Modal } from "@/components/modals/Modal";
import { useReduxState } from "@/hook/useRedux";
import { useAppDispatch } from "@/app/redux";
import { setSingleData } from "@/state";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useState, useTransition } from "react";
import { sellProduct } from "@/actions/inventory";
import { toast } from "sonner";

export const ShowProductModal = () => {
	const showProductModal = useShowProductModal();
	const { singleData, token } = useReduxState();
	const dispatch = useAppDispatch();


	const [isPending, startTransition] = useTransition();
	const [sold, setSold] = useState<boolean>(false);
	const [customerInfo, setCustomerInfo] = useState<{
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
		amount_paid: string;
	}>({
		buyer_name: "",
		buyer_email: "",
		phone_no: "",
		amount_paid: "",
	});

	const handleClose = () => {
		showProductModal.onClose();
		dispatch(setSingleData(null));
		setSold(false);
		setCustomerInfo({
			buyer_name: "",
			buyer_email: "",
			phone_no: "",
			amount_paid: "",
		});
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCustomerInfo(prev => ({ ...prev, [name]: value }));
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

				const { data, error } = await sellProduct({
					token,
					serialNo: singleData?.serial_no!,
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
					<p className="font-semibold text-base mt-3 px-4">
						Customers Information
					</p>
					<div className="space-y-4 p-4">
						<div className="flex items-center gap-4">
							<div className="flex flex-col gap-1 flex-1">
								<p className="text-sm text-gray-500 font-semibold">
									Customers Name
								</p>
								<Input
									value={customerInfo?.buyer_name}
									className=""
									onChange={handleChange}
									name="buyer_name"
									placeholder="Customers Full Name"
								/>
							</div>

							<div className="flex flex-col gap-1 flex-1">
								<p className="text-sm text-gray-500 font-semibold">
									Customers Email
								</p>
								<Input
									value={customerInfo?.buyer_email}
									className=""
									name="email"
									onChange={handleChange}
									placeholder="Customers Email"
								/>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<div className="flex flex-col gap-1 flex-1">
								<p className="text-sm text-gray-500 font-semibold">
									Customers Phone Number
								</p>
								<Input
									value={customerInfo?.phone_no}
									className=""
									onChange={handleChange}
									name="phone_number"
									placeholder="Customers Phone Number"
								/>
							</div>

							<div className="flex flex-col gap-1 flex-1">
								<p className="text-sm text-gray-500 font-semibold">
									Amount Paid
								</p>
								<Input
									value={customerInfo?.amount_paid}
									className=""
									name="amountPaid"
									placeholder="Amount Paid"
									onChange={handleChange}
								/>
							</div>
						</div>
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
				<Button className="w-full py-5">Swap</Button>
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
