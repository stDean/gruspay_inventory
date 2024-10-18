"use client";

import { AddProductForm } from "@/components/auth/AddProductForm";
import { Modal } from "@/components/modals/Modal";
import useAddSingleProductModal from "@/hook/useAddSingleProductModal";

export const AddSingleProductModal = () => {
	const addSingleProduct = useAddSingleProductModal();

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Add Product</h1>
		</>
	);

	return (
		<Modal
			isOpen={addSingleProduct.isOpen}
			onClose={addSingleProduct.onClose}
			headerContent={headerContent}
			body={<AddProductForm />}
      onSubmit={() => {}}
		/>
	);
};
