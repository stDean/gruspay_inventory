"use client";

import { Modal } from "./Modal";
import useSwapProductDetailModal from "@/hook/useSwapProductDetailModal";
import { Input } from "@/components/ui/input";

const MyInput = ({ label, value }: { label: string; value: string }) => {
	return (
		<div className="flex-1">
			<p className="text-xs">{label}</p>
			<Input value={value} disabled />
		</div>
	);
};

export const SwapDetailModal = () => {
	const swapProductDetails = useSwapProductDetailModal();

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Item Details</h1>
		</>
	);

	const bodyContent = (
		<>
			<div className="p-2 px-6 w-full space-y-2">
				<h1 className="text-sm font-semibold">Outgoing Product</h1>

				<div className="flex items-center gap-4">
					<MyInput
						label="Product Name"
						value={swapProductDetails.product!?.product_name!}
					/>
					<MyInput
						label="Serial Number"
						value={swapProductDetails.product!?.serial_no!}
					/>
				</div>
				<div className="flex items-center gap-4">
					<MyInput
						label="Product Price"
						value={swapProductDetails.product!?.price!}
					/>
					<MyInput
						label="Amount Included"
						value={swapProductDetails.product!?.bought_for!}
					/>
				</div>
			</div>

			<hr />

			<div className="p-2 px-6 w-full space-y-2">
				<h1 className="text-sm font-semibold">Supplier Information</h1>

				<div className="flex items-center gap-4 ">
					<MyInput
						label="Supplier Name"
						value={swapProductDetails.product!?.Supplier.supplier_name!}
					/>
					<MyInput
						label="Supplier Phone Number"
						value={swapProductDetails.product!?.Supplier.supplier_phone_no!}
					/>
				</div>
			</div>

			<hr />

			<div className="p-2 px-6 space-y-2">
				<h1 className="text-sm font-semibold">Incoming Product(s)</h1>
				{swapProductDetails.product!?.OutgoingProduct!.incomingProducts.map(
					(product, idx) => (
						<div key={product.id} className="w-full space-y-2">
							<div className="flex items-center gap-4">
								<MyInput
									label={`Product Name(${idx + 1})`}
									value={product.product_name}
								/>
								<MyInput label={`Serial Number`} value={product.serial_no} />
							</div>
							<div className="flex items-center gap-4">
								<MyInput label={`Product Price`} value={product.price} />
								<MyInput label={`Brand`} value={product.brand} />
							</div>
						</div>
					)
				)}
			</div>

			<hr />

			<div className="p-2 px-6 w-full space-y-2 mb-2">
				<h1 className="text-sm font-semibold">Customer Information</h1>

				<div className="flex items-center gap-4 ">
					<MyInput
						label="Customer Name"
						value={swapProductDetails.product!?.Customer!.buyer_name!}
					/>
					<MyInput
						label="Customer Number"
						value={swapProductDetails.product!?.Customer!.buyer_phone_no!}
					/>
				</div>
			</div>
		</>
	);

	return (
		<Modal
			isOpen={swapProductDetails.isOpen}
			onClose={swapProductDetails.onClose}
			headerContent={headerContent}
			body={bodyContent}
			addStyle="mt-10"
      lessPadd="!p-4"
		/>
	);
};
