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
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectItem } from "../ui/select";
import { DatePicker } from "./CustomDatePicker";
import { CustomSelect } from "./CustomSelect";
import { getSuppliers } from "@/actions/user";
import { SupplierProps } from "@/lib/types";

export const AddProductForm = () => {
	const [isPending, startTransition] = useTransition();
	const addSingleProductModal = useAddSingleProductModal();
	const { token, user } = useReduxState();
	const [suppliers, setSuppliers] = useState<Array<SupplierProps>>([]);

	const getAllSuppliers = useCallback(() => {
		startTransition(async () => {
			const res = await getSuppliers({ token });
			if ("error" in res) {
				toast.error("Error", { description: res?.error });
				return;
			}
			setSuppliers(res?.data.suppliers);
		});
	}, []);

	useEffect(() => {
		getAllSuppliers();
	}, []);

	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [status, setStatus] = useState("");
	const [date, setDate] = useState<Date>(new Date());
	const [filterSupplier, setFilterSupplier] = useState<Array<SupplierProps>>(
		[]
	);

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

	const disableSubmit = Object.entries(form.watch())
		.filter(([key]) => !["supplier_email", "purchaseDate"].includes(key))
		.some(([, value]) => value === "");

	const handleAddProduct = (data: z.infer<typeof AddProductSchema>) => {
		const products = {
			...data,
			purchaseDate: new Date(date).toISOString(),
		};

		startTransition(async () => {
			const res = await addSingleProduct({
				val: { ...products, price: user?.role === "ADMIN" ? data.price : "0" },
				token,
				status,
			});
			if (res?.status === 400 && res?.error) {
				toast.error("Error", { description: res?.error });
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

	const searchSupplier = form.watch().supplier_name;
	useEffect(() => {
		const filteredSuppliers = suppliers.filter(sup =>
			sup.supplier_name.toLowerCase().includes(searchSupplier.toLowerCase())
		);
		setFilterSupplier(filteredSuppliers);
	}, [suppliers, searchSupplier]);

	const handleSupplierSelection = (
		supplier_name: string,
		supplier_phone_no: string,
		supplier_email?: string
	) => {
		// Set the selected supplier's details in the form
		form.setValue("supplier_name", supplier_name); // Populate the name
		form.setValue("supplier_email", supplier_email || ""); // Populate the email (if any)
		form.setValue("supplier_phone_no", supplier_phone_no); // Populate the phone number (if any)

		// Close the dropdown and clear the search term
		setIsDropdownVisible(false); // Close dropdown
		setFilterSupplier([]); // Reset filterSupplier array
	};

	useEffect(() => {
		// Show dropdown only when there are matching suppliers
		if (searchSupplier && filterSupplier.length > 0) {
			setIsDropdownVisible(true);
		} else {
			setIsDropdownVisible(false);
		}
	}, [filterSupplier]);

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

							{/* Change this to a date picker */}
							<div className="flex flex-col w-full gap-1">
								<p className="font-medium text-gray-700">Purchase Date</p>
								<DatePicker date={date} setDate={setDate} />
							</div>
						</div>

						<CustomTextArea
							name="description"
							label="Description"
							control={form.control}
							placeholder="Item Description"
						/>

						<hr />

						<div className="relative">
							<CustomInput
								name="supplier_name"
								label="Supplier Name"
								control={form.control}
								placeholder="Supplier Name"
							/>

							{isDropdownVisible && (
								<div className="absolute border-2 rounded-md border-grey-500 bg-white z-50 w-full top-[60px] left-0">
									<div
										className={`${
											filterSupplier.length > 3
												? "max-h-40 overflow-y-auto scrollbar-thin"
												: ""
										}`}
									>
										{filterSupplier.map(
											(
												{ supplier_name, supplier_phone_no, supplier_email },
												idx
											) => (
												<div
													key={`${supplier_name}-${supplier_phone_no}`}
													className={`flex flex-col ${
														idx !== filterSupplier.length - 1 && "border-b"
													} cursor-pointer p-2 pl-4 hover:bg-zinc-100`}
													onClick={() =>
														handleSupplierSelection(
															supplier_name,
															supplier_phone_no,
															supplier_email
														)
													}
												>
													<p className="text-sm font-semibold">
														{supplier_name}
													</p>
													<p className="text-xs">
														{supplier_phone_no} -{" "}
														{supplier_email || "no email provided"}
													</p>
												</div>
											)
										)}
									</div>
								</div>
							)}
						</div>

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
						<Button
							disabled={isPending || disableSubmit || status === ""}
							className={`px-6 py-5 ml-auto`}
						>
							Add Product
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
