"use client";

import { addSingleProduct } from "@/actions/inventory";
import { CustomInput } from "@/components/auth/CustomInput";
import { CustomTextArea } from "@/components/auth/CustomTextArea";
import { Form } from "@/components/ui/form";
import useAddSingleProductModal from "@/hook/useAddSingleProductModal";
import { useReduxState } from "@/hook/useRedux";
import { AddProductSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";

export const AddProductForm = () => {
	const [isPending, startTransition] = useTransition();
	const addSingleProductModal = useAddSingleProductModal();
	const { token } = useReduxState();

	const form = useForm<z.infer<typeof AddProductSchema>>({
		resolver: zodResolver(AddProductSchema),
		defaultValues: {
			product_name: "",
			brand: "",
			description: "",
			type: "",
			price: "",
			serial_no: "",
			supplier_name: "",
			supplier_phone_no: "",
			supplier_email: "",
		},
	});
	const handleAddProduct = (data: z.infer<typeof AddProductSchema>) => {
		startTransition(async () => {
			const { error, status } = await addSingleProduct({ val: data, token });
			if (status === 400 && error) {
				toast.error("Error", { description: error });
				setTimeout(() => {
					addSingleProductModal.onClose();
					form.reset();
				}, 300);
				return;
			}

			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			toast.success("Success", {
				description: "Product added successfully",
			});

			setTimeout(() => {
				addSingleProductModal.onClose();
				form.reset();
			}, 300);
		});
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleAddProduct)}>
					<div className="flex flex-col gap-4 p-6 w-full">
						<div className="flex justify-between items-center gap-5">
							<CustomInput
								name="type"
								label="Item Type"
								control={form.control}
								placeholder="Item Type"
							/>

							<CustomInput
								name="brand"
								label="Brand"
								control={form.control}
								placeholder="Brand"
							/>
						</div>

						<CustomInput
							name="product_name"
							label="Product Name"
							control={form.control}
							placeholder="Product Name"
						/>

						<div className="flex justify-between items-center gap-5">
							<CustomInput
								name="serial_no"
								label="Serial Number"
								control={form.control}
								placeholder="Serial Number"
							/>

							<CustomInput
								name="price"
								label="Price"
								control={form.control}
								placeholder="Price"
							/>
						</div>

						<CustomTextArea
							name="description"
							label="Description"
							control={form.control}
							placeholder="Item Description"
						/>

						<hr />

						<CustomInput
							name="supplier_name"
							label="Supplier Name"
							control={form.control}
							placeholder="Supplier Name"
						/>

						<div className="flex justify-between items-center gap-5">
							<CustomInput
								name="supplier_email"
								label="Supplier Email"
								control={form.control}
								placeholder="Supplier Email"
							/>

							<CustomInput
								name="supplier_phone_no"
								label="Supplier Phone Number"
								control={form.control}
								placeholder="Supplier Phone Number"
							/>
						</div>
					</div>

					<div className="border-t p-6 flex mt-6">
						<Button disabled={isPending} className={`px-6 py-5 ml-auto`}>
							Add Product
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
