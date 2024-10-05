"use client";

import { Input } from "@/components/ui/input";

export const CustomerInfo = ({
	customerInfo,
	handleChange,
	balance_owed,
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
}) => {
	console.log({ customerInfo });

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
				</div>
			</div>
		</>
	);
};
