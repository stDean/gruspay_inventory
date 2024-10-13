"use client";

import { getProduct, swapProducts } from "@/actions/inventory";
import { CustomerInfo } from "@/components/CustomerInfo";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProductsNotSold } from "@/hook/useAllProductsNotSold";
import { useReduxState } from "@/hook/useRedux";
import useSwapProductModal from "@/hook/useSwapModal";
import { ArrowRight, PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	ChangeEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import { toast } from "sonner";

interface IncomingProductProps {
	product_name: string;
	type: string;
	brand: string;
	serial_no: string;
	description: string;
	price: string;
}

export const SwapProductModal = () => {
	const router = useRouter();
	const swapProductModal = useSwapProductModal();
	const [isPending, startTransition] = useTransition();
	const { token } = useReduxState();

	const [search, setSearch] = useState<{ show: boolean; value: string }>({
		show: false,
		value: "",
	});
	const [incoming, setIncoming] = useState<IncomingProductProps>({
		product_name: "",
		type: "",
		brand: "",
		serial_no: "",
		description: "",
		price: "",
	});
	const [products, setProducts] = useState<IncomingProductProps[]>([]);

	const [customerInfo, setCustomerInfo] = useState<{
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
		amount_paid: string;
	}>({
		buyer_name: "",
		buyer_email: "",
		phone_no: "",
		amount_paid: "",
	});

	const handleChangeCustomerInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCustomerInfo(prev => ({ ...prev, [name]: value }));
	};

	const isFilled = useMemo(
		() => Object.values(incoming).every(value => value !== ""),
		[incoming]
	);

	const handleChange = (e: ChangeEvent<any>) => {
		const { name, value } = e.target;
		setIncoming(prev => ({ ...prev, [name]: value }));
	};

	const handleAnotherIncoming = () => {
		const isDuplicate = products.some(
			product => product.serial_no === incoming.serial_no
		);
		if (isDuplicate) {
			toast.warning("Error", {
				description: "Product has already been added",
			});
			return;
		}

		setProducts(prevProducts => {
			const updatedProducts = [...prevProducts, incoming];
			return updatedProducts;
		});
		setIncoming({
			product_name: "",
			type: "",
			brand: "",
			serial_no: "",
			description: "",
			price: "",
		});
	};

	const { allProducts } = useProductsNotSold({ token });
	const [showOptions, setShowOptions] = useState(false);

	const filteredOption = allProducts?.filter((product: any) => {
		if (search.value !== "") {
			return product.serial_no
				.toLowerCase()
				.includes(search.value.toLowerCase());
		} else {
			return [];
		}
	});

	useEffect(() => {
		if (search.value !== "") {
			setShowOptions(true);
		} else {
			setShowOptions(false);
		}
	}, [search.value]);

	const handleConfirmSwap = useCallback(async () => {
		startTransition(async () => {
			const isDuplicate = products.some(
				product => product.serial_no === incoming.serial_no
			);

			if (isDuplicate) {
				toast.warning("Error", {
					description: "Product has already been added",
				});
				return;
			}

			// Update products in the state first
			setProducts(prevProducts => {
				const updatedProducts = [...prevProducts, incoming];
				return updatedProducts;
			});

			// Prepare data for the backend request
			const dataToDb = {
				incoming: [...products, incoming], // make sure to include the new product
				outgoing: swapProductModal.items[0].serial_no,
				customerInfo: customerInfo,
			};

			// Submit to backend (separate async from state setter)
			const { data, error } = await swapProducts({ token, ...dataToDb });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			toast.success("Success", { description: data?.msg });
			// Reset incoming product
			setIncoming({
				product_name: "",
				type: "",
				brand: "",
				serial_no: "",
				description: "",
				price: "",
			});

			setCustomerInfo({
				buyer_name: "",
				buyer_email: "",
				phone_no: "",
				amount_paid: "",
			});

			swapProductModal.onClose();
			router.push("/inventory");
		});
	}, [products, incoming, token, customerInfo, swapProductModal.items]);

	const handleAddAnotherItem = async (serial_no: string) => {
		if (!serial_no) return;

		const { data } = await getProduct({ serialNo: serial_no, token });
		swapProductModal.addItem({
			serial_no: data.serial_no,
			price: data.price,
			product_name: data.product_name,
		});
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Swap Product(s)</h1>
		</>
	);

	useEffect(() => {
		setSearch({ show: false, value: "" });
		setIncoming({
			product_name: "",
			type: "",
			brand: "",
			serial_no: "",
			description: "",
			price: "",
		});
		setProducts([]);
		setShowOptions(false);
	}, [swapProductModal.isOpen]);

	const bodyContent = (
		<>
			<div className="p-4 space-y-2">
				<div className="flex justify-between items-center">
					<p className="text-sm font-semibold w-44">Outgoing Item(s)</p>
					{search.show && (
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
										handleAddAnotherItem(search.value!);
										setSearch({ show: false, value: "" });
									}}
								>
									<ArrowRight className="w-5 h-5 " />
								</div>
							</div>

							{showOptions && (
								<div className="bg-white border rounded-md w-full shadow-md absolute top-11 left-0">
									{filteredOption.map((item: any) => (
										<p
											key={item.id}
											className="p-3 cursor-pointer hover:bg-gray-100"
											onClick={() => {
												setSearch({ ...search, value: item.serial_no });
												setShowOptions(prev => !prev);
											}}
										>
											{item.serial_no}
										</p>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex gap-4 items-center flex-wrap">
					{swapProductModal.items.map((item: any) => (
						<div
							className="flex items-center gap-2 border rounded-lg p-2 "
							key={item.serial_no}
						>
							<p className="flex flex-col gap-1 flex-1 text-sm">
								<span>{item.serial_no}</span>
								<span className="text-gray-500 text-sm font-semibold">
									{item.product_name} | {item.price}
								</span>
							</p>

							<X
								className="text-red-500 cursor-pointer hover:text-red-400 h-4 w-4 self-start"
								onClick={() => swapProductModal.removeItem(item.serial_no)}
							/>
						</div>
					))}
				</div>

				{swapProductModal.items.length === 0 && (
					<p
						className="border p-1 rounded-lg border-blue-500 w-fit text-xs text-blue-500 cursor-pointer hover:border-blue-400 hover:text-blue-400 flex gap-1 items-center"
						onClick={() => setSearch({ show: true, value: "" })}
					>
						Add Outgoing Item <PlusCircle className="h-4 w-4" />
					</p>
				)}
			</div>

			<hr />

			<div className="p-4 pt-0 space-y-2">
				<CustomerInfo
					customerInfo={customerInfo}
					handleChange={handleChangeCustomerInfo}
				/>
			</div>

			<hr />

			<div className="p-4 space-y-3">
				<p className="font-semibold text-sm">Incoming Item(s)</p>

				<div className="flex flex-col gap-4">
					<div className="flex gap-4">
						<Input
							placeholder="product name"
							value={incoming.product_name}
							onChange={handleChange}
							name="product_name"
						/>
						<Input
							placeholder="product serial number"
							value={incoming.serial_no}
							onChange={handleChange}
							name="serial_no"
						/>
					</div>

					<div className="flex gap-4">
						<Input
							placeholder="product type"
							value={incoming.type}
							onChange={handleChange}
							name="type"
						/>
						<Input
							placeholder="product price"
							value={incoming.price}
							onChange={handleChange}
							name="price"
						/>
						<Input
							placeholder="product brand"
							value={incoming.brand}
							onChange={handleChange}
							name="brand"
						/>
					</div>
					<Textarea
						placeholder="product description"
						className="h-16"
						name="description"
						onChange={handleChange}
						value={incoming.description}
					/>
				</div>

				{isFilled && products.length !== 2 && (
					<p
						className="border p-1 rounded-lg border-blue-500 w-fit text-xs text-blue-500 cursor-pointer hover:border-blue-400 hover:text-blue-400 flex gap-1 items-center"
						onClick={handleAnotherIncoming}
					>
						Add another Item <PlusCircle className="h-4 w-4" />
					</p>
				)}
			</div>

			<hr />

			<div className="flex items-center p-6 gap-6">
				<Button
					className="w-full py-5 bg-green-500 hover:bg-green-400"
					onClick={handleConfirmSwap}
					disabled={isPending}
				>
					Confirm Swap
				</Button>
			</div>
		</>
	);

	return (
		<Modal
			isOpen={swapProductModal.isOpen}
			onClose={swapProductModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
		/>
	);
};
