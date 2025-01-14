"use client";

import { Input } from "@/components/ui/input";
import { useReduxState } from "@/hook/useRedux";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { getCustomers } from "@/actions/user";
import { toast } from "sonner";
import { CustomerProps } from "@/lib/types";

const NestedDrop = ({
	onModeChange,
	onBankChange,
}: {
	onModeChange: (mode: string) => void;
	onBankChange: (bank: string) => void;
}) => {
	const { user } = useReduxState(); // Assuming you have a way to access user data
	const [selectedMode, setSelectedMode] = useState("");
	const [selectedBank, setSelectedBank] = useState("");
	const [drop, setDrop] = useState<boolean>(false);
	const [showBanks, setShowBanks] = useState<boolean>(false);

	const handleModeChange = (mode: string) => {
		setSelectedMode(mode);
		setSelectedBank(""); // Reset bank when mode changes
		onModeChange(mode); // Notify parent
	};

	const handleBankChange = (bankName: string) => {
		setSelectedBank(bankName);
		onBankChange(bankName); // Notify parent
		setShowBanks(false); // Close bank options
		setDrop(false); // Close the main dropdown
	};

	const bankOptions = user?.UserBank?.map(bank => ({
		value: bank.bankName,
		label: bank.bankName,
	}));

	return (
		<div className="relative">
			{/* Main Dropdown Trigger */}
			<div
				className="h-9 w-full border shadow-sm border-gray-200 rounded-lg p-2 text-gray-800 flex justify-between items-center hover:cursor-pointer relative text-xs"
				onClick={() => {
					setDrop(drop => !drop);
					setShowBanks(false);
				}}
			>
				{selectedMode === "Transfer"
					? `${selectedMode} (${selectedBank})`
					: selectedMode || "Select mode of payment"}
				<ChevronDown className="h-4 w-4 text-black" />
			</div>

			{/* Main Dropdown Content */}
			{drop && (
				<div className="bg-white rounded-lg border p-3 z-[9999] font-semibold absolute w-full top-10 space-y-3">
					{/* Cash Option */}
					<p
						className="hover:cursor-pointer"
						onClick={() => {
							handleModeChange("Cash");
							setDrop(false);
						}}
					>
						Cash
					</p>
					<hr />
					{/* Transfer Option */}
					<div className="flex justify-between items-center hover:cursor-pointer relative">
						<p
							onClick={() => {
								handleModeChange("Transfer");
								setShowBanks(true);
							}}
							className="flex-grow"
						>
							Transfer
						</p>
						<ChevronRight className="h-4 w-4 text-black" />
						{/* Bank Options */}
						{showBanks && (
							<div className="absolute bg-white rounded-lg border p-3 z-[9999] -right-44 top-100 w-40 space-y-2">
								{bankOptions?.map(bank => (
									<span
										key={bank.value}
										className="block hover:bg-gray-100 p-2 rounded-md hover:cursor-pointer"
										onClick={() => handleBankChange(bank.label)}
									>
										{bank.label}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export const CustomerInfo = ({
	customerInfo,
	handleChange,
	balance_owed,
	amount,
	swap,
	handleModeChange,
	handleBankChange,
}: {
	customerInfo: {
		buyer_name: string;
		buyer_email?: string;
		phone_no: string;
		amount_paid: string;
		balance_owed?: string;
	};
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	balance_owed?: boolean;
	amount?: boolean;
	swap?: boolean;
	handleModeChange: (mode: string) => void;
	handleBankChange: (bank: string) => void;
}) => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [customers, setCustomers] = useState<Array<CustomerProps>>([]);
	const [filterCustomers, setFilterCustomers] = useState<Array<CustomerProps>>(
		[]
	);
	const [selectCustomer, setSelectCustomer] = useState<{
		name: string;
		email: string;
		phone: string;
	}>({
		name: "",
		email: "",
		phone: "",
	});

	const getAllCustomers = useCallback(() => {
		startTransition(async () => {
			const res = await getCustomers({ token });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}
			setCustomers(res?.data.customers);
		});
	}, []);

	useEffect(() => {
		getAllCustomers();
	}, []);

	console.log({ isPending });

	useEffect(() => {
		if (customerInfo.buyer_name) {
			const filtered = customers.filter(cus =>
				cus.buyer_name
					.toLowerCase()
					.includes(customerInfo.buyer_name.toLowerCase())
			);
			setFilterCustomers(filtered);
		} else {
			setFilterCustomers([]);
		}
	}, [customers, customerInfo.buyer_name]);

	return (
		<>
			<p className="font-semibold text-base mt-3">Customers Information</p>
			<div className="space-y-3">
				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-1 flex-1 relative">
						<p className="text-sm text-gray-500 font-semibold">
							Customers Name
						</p>
						<Input
							value={selectCustomer.name || customerInfo?.buyer_name}
							onChange={e => {
								handleChange(e);
								setSelectCustomer(prev => ({
									...prev,
									name: e.target.value,
								}));
							}}
							name="buyer_name"
							placeholder="Customer Full Name"
						/>

						{filterCustomers.length > 0 && (
							<div className="absolute border-2 rounded-md border-grey-500 bg-white z-50 w-full top-[60px] left-0">
								<div
									className={`${
										filterCustomers.length > 3
											? "max-h-40 overflow-y-auto scrollbar-thin"
											: ""
									}`}
								>
									{filterCustomers.map(
										({ buyer_name, buyer_phone_no, buyer_email }, idx) => (
											<div
												key={`${buyer_name}-${buyer_phone_no}`}
												className={`flex flex-col ${
													idx !== filterCustomers.length - 1 && "border-b"
												} cursor-pointer p-2 pl-4 hover:bg-zinc-100`}
												onClick={() => {
													setSelectCustomer({
														name: buyer_name,
														phone: buyer_phone_no,
														email: buyer_email || "",
													});
													handleChange({
														target: { name: "buyer_name", value: buyer_name },
													} as any);
													handleChange({
														target: {
															name: "buyer_email",
															value: buyer_email || "",
														},
													} as any);
													handleChange({
														target: { name: "phone_no", value: buyer_phone_no },
													} as any);
													setFilterCustomers([]);
												}}
											>
												<p className="text-sm font-semibold">{buyer_name}</p>
												<p className="text-xs">
													{buyer_phone_no} -{" "}
													{buyer_email || "No email provided"}
												</p>
											</div>
										)
									)}
								</div>
							</div>
						)}
					</div>

					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">
							Customers Email
						</p>
						<Input
							value={selectCustomer.email || customerInfo?.buyer_email}
							name="buyer_email"
							onChange={e => {
								handleChange(e);
								setSelectCustomer(prev => ({
									...prev,
									email: e.target.value,
								}));
							}}
							placeholder="Customers Email"
							type="email"
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-1 flex-1">
						<p className="text-xs text-gray-500 font-semibold">
							Customers Phone Number
						</p>
						<Input
							value={selectCustomer.phone || customerInfo?.phone_no}
							className=""
							onChange={e => {
								handleChange(e);
								setSelectCustomer(prev => ({
									...prev,
									phone: e.target.value,
								}));
							}}
							name="phone_no"
							placeholder="Customers Phone Number"
						/>
					</div>

					{amount && (
						<div className="flex flex-col gap-1 flex-1">
							<p className="text-xs text-gray-500 font-semibold">Amount Paid</p>
							<Input
								value={customerInfo?.amount_paid}
								className=""
								name="amount_paid"
								placeholder="Amount Paid"
								onChange={handleChange}
							/>
						</div>
					)}

					{swap && (
						<div className="flex flex-col gap-1 flex-1">
							<p className="text-xs text-gray-500 font-semibold">
								Mode Of Payment
							</p>

							<NestedDrop
								onModeChange={handleModeChange}
								onBankChange={handleBankChange}
							/>
						</div>
					)}
				</div>

				<div className="flex items-center gap-4">
					{balance_owed && (
						<div className="flex flex-col gap-1 flex-1">
							<p className="text-xs text-gray-500 font-semibold">
								Balance Owed
							</p>
							<Input
								value={customerInfo?.balance_owed}
								className=""
								name="balance_owed"
								placeholder="Balance Owed"
								onChange={handleChange}
							/>
						</div>
					)}

					{!swap && (
						<div className="flex flex-col gap-1 flex-1">
							<p className="text-xs text-gray-500 font-semibold">
								Mode Of Payment
							</p>

							<NestedDrop
								onModeChange={handleModeChange}
								onBankChange={handleBankChange}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	);
};
