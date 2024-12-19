"use client";

import { addSingleProduct } from "@/actions/inventory";
import { CustomInput } from "@/components/auth/CustomInput";
import { CustomTextArea } from "@/components/auth/CustomTextArea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useAddSingleProductModal from "@/hook/useAddSingleProductModal";
import { useReduxState } from "@/hook/useRedux";
import { AddProductSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectItem } from "../ui/select";
import { CustomSelect } from "./CustomSelect";

export const AddProductForm = () => {
	const [isPending, startTransition] = useTransition();
	const addSingleProductModal = useAddSingleProductModal();
	const { token, user } = useReduxState();

	const [status, setStatus] = useState("");

	const form = useForm<z.infer<typeof AddProductSchema>>({
		resolver: zodResolver(AddProductSchema),
		defaultValues: {
			product_name: "",
			brand: "",
			description: "",
			type: "",
			price: user?.role === "ADMIN" ? "" : "0",
			serial_no: "",
			supplier_name: "",
			supplier_phone_no: "",
			supplier_email: "",
			purchaseDate: "",
		},
	});
	const handleAddProduct = (data: z.infer<typeof AddProductSchema>) => {
		startTransition(async () => {
			const res = await addSingleProduct({
				val: { ...data, price: user?.role === "ADMIN" ? data.price : "0" },
				token,
				status,
			});
			if (res?.status === 400 && res?.error) {
				toast.error("Error", { description: res?.error });
				// setTimeout(() => {
				// 	addSingleProductModal.onClose();
				// 	form.reset();
				// }, 300);
				return;
			}

			if (res?.error) {
				toast.error("Error", { description: res?.error });
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
						<div className="flex flex-col md:flex-row justify-between items-center gap-5">
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

							<div className="flex-1 space-y-1">
								<p>Status</p>
								<CustomSelect
									label="Status"
									items={
										<>
											{["New", "Used"].map(type => (
												<SelectItem value={type} key={type}>
													{type}
												</SelectItem>
											))}
										</>
									}
									handleChange={(value: string) => setStatus(value)}
									value={status}
									width3
									placeHolder="Select Status"
								/>
							</div>
						</div>

						<CustomInput
							name="product_name"
							label="Product Name"
							control={form.control}
							placeholder="Product Name"
						/>

						<div className="flex flex-col md:flex-row justify-between items-center gap-5">
							<CustomInput
								name="serial_no"
								label="Serial Number"
								control={form.control}
								placeholder="Serial Number"
							/>

							{user?.role === "ADMIN" && (
								<CustomInput
									name="price"
									label="Price"
									control={form.control}
									placeholder="Price"
								/>
							)}

							<CustomInput
								name="purchaseDate"
								label="Purchase Date"
								control={form.control}
								placeholder="e.g yyyy-mm-dd"
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
