"use client";

import useShowSoldInfoModal from "@/hook/useShowSoldDetails";
import { Modal } from "@/components/modals/Modal";
import { Input } from "@/components/ui/input";

const MyInput = ({ label, value }: { label: string; value: string }) => {
	return (
		<div className="flex-1">
			<p className="text-xs">{label}</p>
			<Input value={value} disabled />
		</div>
	);
};

export const SoldDetailModal = () => {
	const productDetails = useShowSoldInfoModal();

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Item Details</h1>
		</>
	);

	const bodyContent = (
		<>
			<div className="p-4 px-6 w-full space-y-3">
				<h1 className="text-sm font-semibold">Product Information</h1>

				<div className="flex items-center gap-4">
					<MyInput
						label="Product Name"
						value={productDetails.product?.product_name as string}
					/>
					<MyInput
						label="Serial Number"
						value={productDetails.product?.serial_no as string}
					/>
				</div>
				<div className="flex items-center gap-4">
					<MyInput
						label="Product Price"
						value={productDetails.product?.price as string}
					/>
					<MyInput
						label="Bought For"
						value={productDetails.product?.bought_for as string}
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
					/>
					<MyInput
						label="Supplier Phone Number"
						value={productDetails.product?.Supplier.supplier_phone_no as string}
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
					/>
					<MyInput
						label="Customer Number"
						value={productDetails.product?.Customer?.buyer_phone_no as string}
					/>
				</div>
			</div>
		</>
	);

	return (
		<Modal
			isOpen={productDetails.isOpen}
			onClose={productDetails.onClose}
			headerContent={headerContent}
			body={bodyContent}
      onSubmit={() => {}}
		/>
	);
};
