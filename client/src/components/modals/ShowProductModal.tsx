"use client";

import {
  getProduct,
  sellProduct,
  sellSingleProduct,
} from "@/actions/inventory";
import { useAppDispatch } from "@/app/redux";
import { CustomerInfo } from "@/components/CustomerInfo";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductsNotSold } from "@/hook/useAllProductsNotSold";
import { useReduxState } from "@/hook/useRedux";
import useShowProductModal from "@/hook/useShowProduct";
import useSwapProductModal, { ItemProps } from "@/hook/useSwapModal";
import { setSingleData } from "@/state";
import { ArrowRight, PlusCircle, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export const ShowProductModal = () => {
	const showProductModal = useShowProductModal();
	const swapProductModal = useSwapProductModal();

	const { singleData, token } = useReduxState();
	const dispatch = useAppDispatch();

	const [isPending, startTransition] = useTransition();
	const [sold, setSold] = useState<boolean>(false);

	const [customerInfo, setCustomerInfo] = useState<{
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
		amount_paid: string;
		balance_owed?: string;
	}>({
		buyer_name: "",
		buyer_email: "",
		phone_no: "",
		amount_paid: "",
		balance_owed: "",
	});

	// Mode of payment
	const [selectedMode, setSelectedMode] = useState("");
	const [selectedBank, setSelectedBank] = useState("");

	const handleModeChange = (mode: string) => {
		setSelectedMode(mode);
	};

	const handleBankChange = (bank: string) => {
		setSelectedBank(bank);
	};

	const [search, setSearch] = useState<{ show: boolean; value: string }>({
		show: false,
		value: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCustomerInfo(prev => ({ ...prev, [name]: value }));
	};

	const handleClose = () => {
		showProductModal.onClose();
		dispatch(setSingleData(null));
		setSold(false);
		setCustomerInfo({
			buyer_name: "",
			buyer_email: "",
			phone_no: "",
			amount_paid: "",
			balance_owed: "",
		});
	};

	// Handle the selling process
	const [products, setProducts] = useState<
		Array<{ serialNo: string; amount_paid: string }>
	>([]);

	const handleSold = () => {
		const modeOfPayment =
			selectedMode === "Transfer"
				? `${selectedMode} (${selectedBank})`
				: selectedMode;

		if (sold) {
			startTransition(async () => {
				// Validation
				if (
					customerInfo.buyer_name === "" ||
					customerInfo.phone_no === "" ||
					modeOfPayment === ""
				) {
					toast.error("Error", { description: "Please fill all the fields!" });
					return;
				}

				if (
					!showProductModal?.products ||
					showProductModal.products.length === 0
				) {
					toast.error("Error", { description: "No products selected" });
					return;
				}

				let res;

				// Single sale logic
				if (showProductModal?.products?.length === 1) {
					if (customerInfo.amount_paid === "") {
						toast.error("Error", {
							description: "Please fill the amount paid!",
						});
						return;
					}
					res = await sellSingleProduct({
						token,
						product: {
							amount_paid: customerInfo.amount_paid, // Single product uses customer amount
							serialNo: showProductModal?.products[0].serial_no,
							balance_owed: customerInfo.balance_owed || "0",
						},
						customerInfo,
						modeOfPayment,
					});
				}
				// Bulk sale logic
				else {
					const updatedProducts = showProductModal?.products?.map(
						(product, index) => ({
							serialNo: product.serial_no,
							amount_paid: products[index]?.amount_paid || "", // Gets individual amount from input
						})
					);

					setProducts(updatedProducts);

					// Send request to sell product(s)
					res = await sellProduct({
						token,
						products: updatedProducts,
						customerInfo,
						modeOfPayment,
					});
				}

				// Handle response
				if (res?.error) {
					toast.error("Error", { description: res.error });
					handleClose();
					return;
				}

				toast.success("Success", { description: "Product Sold successfully!" });
				handleClose();
			});
		} else {
			setSold(true);
		}
	};

	const handleSwap = (item: ItemProps) => {
		showProductModal.onClose();
		swapProductModal.onOpen(item);
	};

	const { allProducts } = useProductsNotSold({ token });

	// Filter products based on search input
	const filteredOption = allProducts?.filter((product: any) => {
		if (search.value !== "") {
			return product.serial_no
				.toLowerCase()
				.includes(search.value.toLowerCase());
		}
		return [true];
	});

	// Handle adding another item to the sale
	const handleAddAnotherItem = async (serial_no: string) => {
		if (!serial_no) return;

		const res = await getProduct({ serialNo: serial_no, token });
		if (res?.error) {
			toast.error("Error", { description: res?.error });
			return;
		}

		dispatch(setSingleData(res?.data));
		showProductModal.addProduct({
			serial_no: res?.data.serial_no,
			brand: res?.data.brand,
			name: res?.data.product_name,
		});
	};

	// Update the amount paid for each product
	const handleAmountPaidChange = (index: number, value: string) => {
		setProducts(prevProducts => {
			const updatedProducts = [...prevProducts];
			updatedProducts[index] = {
				...updatedProducts[index],
				amount_paid: value,
			};
			return updatedProducts;
		});
	};

	useEffect(() => {
		setSearch({ show: false, value: "" });
		setProducts([]);
	}, [showProductModal.isOpen]);

	useEffect(() => {
		if (showProductModal?.products && showProductModal.products.length === 0) {
			setProducts([]);
		}
	}, [showProductModal?.products?.length]);

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Item Details</h1>
		</>
	);

	const bodyContent = (
		<>
			<div className="p-4 space-y-2">
				<div className="flex justify-between items-center gap-4">
					<p className="text-xs md:text-sm font-semibold md:w-44">
						Outgoing Item(s)
					</p>

					<div className="flex flex-col gap-2 flex-1 relative">
						<div className="relative border rounded-lg flex-1">
							<Input
								placeholder="serial number..."
								value={search.value}
								className="!border-none"
								onChange={e => {
									setSearch({ show: true, value: e.target.value });
								}}
							/>

							<div
								className="h-full bg-gray-100 border-l border-gray-400 rounded-tr-lg rounded-br-lg absolute right-0 w-11 flex items-center justify-center top-0 cursor-pointer"
								onClick={() => {
									handleAddAnotherItem(search.value);
									setProducts([
										...products,
										{ serialNo: search.value, amount_paid: "" },
									]);
									setSearch({ show: false, value: "" });
								}}
							>
								<ArrowRight className="w-5 h-5 " />
							</div>
						</div>

						{search.value !== "" && (
							<div
								className="bg-white border rounded-md w-full shadow-md absolute top-11 left-0 z-[999] overflow-y-auto scrollbar-thin"
								style={{ maxHeight: "300px" }}
							>
								{filteredOption.map((item: any) => (
									<p
										key={item.id}
										className="p-3 cursor-pointer hover:bg-gray-100"
										onClick={() => {
											setSearch({ ...search, value: item.serial_no });
										}}
									>
										{item.serial_no}
									</p>
								))}
							</div>
						)}
					</div>
				</div>

				<hr />

				{/* Container with fixed height and scroll for products */}
				<div
					className={`flex gap-4 items-center flex-wrap ${
						showProductModal?.products &&
						showProductModal?.products?.length > 10
							? "max-h-64 overflow-y-auto custom-scrollbar"
							: ""
					} `}
				>
					{showProductModal?.products?.map((item, index) => (
						<div key={item.serial_no} className="flex gap-4 items-center">
							<div className="flex items-center gap-2 border rounded-lg p-2 px-1">
								<p className="flex flex-col gap-1 flex-1 text-sm">
									<span>{item.serial_no}</span>
									<span className="text-gray-500 text-sm font-semibold">
										{item.name} | {item.brand}
									</span>
								</p>

								<X
									className="text-red-500 cursor-pointer hover:text-red-400 h-[13px] w-[13px] self-start"
									onClick={() => showProductModal.removeProduct(item.serial_no)}
								/>
							</div>

							{(showProductModal?.products ?? []).length > 1 && (
								<Input
									placeholder="selling price(not required)"
									className="flex-1"
									onChange={e => handleAmountPaidChange(index, e.target.value)}
								/>
							)}
						</div>
					))}
				</div>

				{showProductModal?.products?.length === 0 && (
					<p
						className="border p-1 rounded-lg border-blue-500 w-fit text-xs text-blue-500 cursor-pointer hover:border-blue-400 hover:text-blue-400 flex gap-1 items-center"
						// onClick={() => setSearch({ show: true, value: "" })}
					>
						Add Outgoing Item <PlusCircle className="h-4 w-4" />
					</p>
				)}
			</div>

			<hr />

			{sold && (
				<>
					<div className="p-4 pt-0 space-y-4">
						<CustomerInfo
							customerInfo={customerInfo}
							handleChange={handleChange}
							balance_owed={(showProductModal?.products ?? []).length <= 1}
							amount={(showProductModal?.products ?? []).length <= 1}
							handleModeChange={handleModeChange}
							handleBankChange={handleBankChange}
						/>
					</div>

					<hr />
				</>
			)}

			<div className="flex items-center p-6 gap-6">
				<Button
					className="w-full py-5 bg-green-500 hover:bg-green-400"
					onClick={handleSold}
					disabled={isPending || showProductModal?.products?.length === 0}
				>
					{sold ? "Confirm Sale" : "Mark as Sold"}
				</Button>

				{!sold && (showProductModal?.products ?? []).length <= 1 && (
					<Button
						className="w-full py-5"
						onClick={() =>
							handleSwap({
								product_name: singleData?.product_name as string,
								serial_no: singleData?.serial_no as string,
								brand: singleData?.brand as string,
							})
						}
						disabled={showProductModal?.products?.length === 0}
					>
						Swap
					</Button>
				)}
			</div>
		</>
	);

	return (
		<Modal
			isOpen={showProductModal.isOpen}
			onClose={handleClose}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
