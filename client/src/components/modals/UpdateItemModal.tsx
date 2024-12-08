"use client";

import { getProduct, updateProduct } from "@/actions/inventory";
import { Modal } from "@/components/modals/Modal";
import { Input } from "@/components/ui/input";
import { useReduxState } from "@/hook/useRedux";
import useUpdateItemModal from "@/hook/useUpdateItemModal";
import { useEffect, useState, useTransition } from "react";
import { Spinner } from "../Spinners";
import { ProductProps } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";

const MyInput = ({
	label,
	value,
	disabled,
	onChange,
}: {
	label: string;
	value: string;
	disabled?: boolean;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
	return (
		<div className="flex-1 space-y-1">
			<p className="text-xs">{label}</p>
			<Input value={value} disabled={disabled} onChange={onChange} />
		</div>
	);
};

export const UpdateItemModal = () => {
	const updateItem = useUpdateItemModal();
	const { token } = useReduxState();
	const [product, setProduct] = useState<ProductProps>();
	const [isPending, startTransition] = useTransition();
	const [newPrice, setNewPrice] = useState<string>("");
	const [newDescription, setNewDescription] = useState<string>("");
  const [disable, setDisable] = useState(false)

	const getProd = () => {
		startTransition(async () => {
			const res = await getProduct({
				token,
				serialNo: updateItem.serialNo as string,
			});

			setProduct(res.data);
			setNewPrice(res.data?.price || "");
			setNewDescription(res.data?.description || "");
		});
	};

	useEffect(() => {
		if (updateItem.isOpen) getProd();
	}, [updateItem.isOpen]);

	const handleUpdate = async () => {
		if (!product) return;

		const updatedData = {
			serialNo: product.serial_no,
			price: newPrice,
			description: newDescription,
		};

    setDisable(true)
		const res = await updateProduct({ token, ...updatedData });

		if (res?.error) {
			toast.error("Error", {
				description: res.error,
			});
			return;
		}

		toast.success("Success", { description: "Product updated successfully" });
		updateItem.onClose(); // Close the modal on success
    setDisable(false)
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">
				Update Price & Description
			</h1>
		</>
	);

	const bodyContent = isPending ? (
		<Spinner />
	) : (
		<>
			<div className="p-4 px-6 w-full space-y-3">
				<h1 className="text-sm font-semibold">Product Information</h1>

				<div className="flex items-center gap-4">
					<MyInput
						label="Product Name"
						value={product?.product_name as string}
						disabled
					/>
					<MyInput
						label="Serial Number"
						value={product?.serial_no as string}
						disabled
					/>
				</div>
				<div className="flex items-center gap-4">
					<MyInput
						label="Product Brand"
						value={product?.brand as string}
						disabled
					/>
					<MyInput
						label="Price"
						value={newPrice}
						onChange={e => setNewPrice(e.target.value)}
					/>
				</div>

				<div className="space-y-1">
					<p>Description</p>
					<Textarea
						value={newDescription}
						onChange={e => setNewDescription(e.target.value)}
					/>
				</div>
			</div>

			<hr />

			<div className="p-4 flex justify-end">
				<Button onClick={handleUpdate} disabled={disable}>
					Confirm Update
				</Button>
			</div>
		</>
	);

	return (
		<Modal
			isOpen={updateItem.isOpen}
			onClose={updateItem.onClose}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
