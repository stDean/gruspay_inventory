"use client";

import useShowSoldInfoModal from "@/hook/useShowSoldDetails";
import { Modal } from "@/components/modals/Modal";

export const SoldDetailModal = () => {
	const productDetails = useShowSoldInfoModal();

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Item Details</h1>
		</>
	);

	console.log({ a: productDetails.product });

	return (
		<Modal
			isOpen={productDetails.isOpen}
			onClose={productDetails.onClose}
			headerContent={headerContent}
		/>
	);
};
