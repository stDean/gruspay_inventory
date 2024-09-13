"use client";

import useAddSingleProductModal from "@/hook/useAddSingleProductModal";
import { Modal } from "@/components/modals/Modal";

export const AddSingleProductModal = () => {
	const addSingleProduct = useAddSingleProductModal();

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold">Add Product</h1>
		</>
	);

	return (
		<Modal
			isOpen={addSingleProduct.isOpen}
			onClose={addSingleProduct.onClose}
			headerContent={headerContent}
		/>
	);
};
