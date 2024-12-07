"use client";

import { Input } from "@/components/ui/input";
import { useReduxState } from "@/hook/useRedux";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

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
	return (
		<>
			<p className="font-semibold text-base mt-3">Customers Information</p>
			<div className="space-y-3">
				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">
							Customers Name
						</p>
						<Input
							value={customerInfo?.buyer_name}
							className=""
							onChange={handleChange}
							name="buyer_name"
							placeholder="Customers Full Name"
						/>
					</div>

					<div className="flex flex-col gap-1 flex-1">
						<p className="text-sm text-gray-500 font-semibold">
							Customers Email
						</p>
						<Input
							value={customerInfo?.buyer_email}
							className=""
							name="buyer_email"
							onChange={handleChange}
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
							value={customerInfo?.phone_no}
							className=""
							onChange={handleChange}
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
