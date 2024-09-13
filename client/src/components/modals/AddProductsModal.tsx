"use client";

import { Modal } from "@/components/modals/Modal";
import useAddProductModal from "@/hook/useAddProductModal";
import { ClipboardPenLine } from "lucide-react";
import { SelectButtons } from "@/components/SelectButtons";
import { useState } from "react";
import { AddProductsType } from "@/lib/utils";
import useAddSingleProductModal from "@/hook/useAddSingleProductModal";

export const AddProductsModal = () => {
	const addProductsModal = useAddProductModal();
	const addSingleProduct = useAddSingleProductModal();
	const [options, setOptions] = useState<{
		add_products: (typeof AddProductsType.options)[number];
	}>({ add_products: AddProductsType.options[0] });

	const handleChange = (val: (typeof AddProductsType.options)[number]) => {
		setOptions(prev => ({
			...prev,
			add_products: val,
		}));
	};

	const headerContent = (
		<div className="flex gap-3 items-center">
			<ClipboardPenLine className="h-8 w-8" />

			<div className="">
				<p className="text-black font-semibold text-base">
					Add Items to your inventory
				</p>
				<p className="text-sm text-gray-500">Choose option to add item</p>
			</div>
		</div>
	);

	const bodyContent = (
		<SelectButtons options={options} onChange={handleChange} />
	);

	return (
		<Modal
			isOpen={addProductsModal.isOpen}
			onClose={addProductsModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
			actionLabel="Continue"
			onSubmit={
				options.add_products["title"] === "Add an Item"
					? () => {
							addProductsModal.onClose();
							addSingleProduct.onOpen();
					  }
					: () => {}
			}
			addedStyle="ml-auto"
		/>
	);
};
