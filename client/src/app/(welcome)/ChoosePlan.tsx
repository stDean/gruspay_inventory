"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Card = ({
	plan,
	amount,
	per,
	val,
	users,
	customer,
	customerText,
	supplier,
	supplierText,
	yearFees,
}: {
	plan: string;
	amount: string;
	per: string;
	val: string;
	users: string;
	customer?: boolean;
	customerText?: string;
	supplier?: boolean;
	supplierText?: string;
	yearFees?: string;
}) => {
	const router = useRouter();
	const handleGetPerAndPlan = () => {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("plan", JSON.stringify({ plan, per }));
		}

		router.push("/register");
	};

	return (
		<div className="p-6 rounded-lg border border-gray-200 flex-1 bg-gray-50 flex flex-col hover:shadow-xl transition-shadow ease-in-out cursor-pointer">
			<div className="space-y-6 border-b pb-4">
				<p className="px-4 py-2 font-semibold text-white rounded-3xl bg-blue-500 border w-fit">
					{plan}
				</p>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
					maiores in velit, quasi recusandae consequuntur sed excepturi
				</p>

				<div className="pt-3 space-y-2">
					<span className="text-3xl lg:text-4xl font-semibold">{amount}</span> /
					month
					<p className="">
						Billed yearly <span className="font-semibold">{yearFees}</span>
					</p>
				</div>
			</div>

			<div className="border-b py-6 space-y-4 font-semibold flex-1">
				<p className="flex gap-4">
					<Check className="h-5 w-5" /> Up to {val} inventory items.
				</p>
				<p className="flex gap-4">
					<Check className="h-5 w-5" /> Analytics.
				</p>
				<p className="flex gap-4">
					<Check className="h-5 w-5" /> {users}.
				</p>
				{supplier && (
					<p className="flex gap-4">
						<Check className="h-5 w-5" /> {supplierText}.
					</p>
				)}
				{customer && (
					<p className="flex gap-4">
						<Check className="h-5 w-5" /> {customerText}.
					</p>
				)}
			</div>

			<div className="pt-6">
				<Button
					variant="outline"
					className="w-full py-6 font-semibold"
					onClick={handleGetPerAndPlan}
				>
					Get Started
				</Button>
			</div>
		</div>
	);
};

export const ChoosePlan = () => {
	const [type, setType] = useState<"monthly" | "yearly">("monthly");

	return (
		<div className="flex flex-col gap-8 items-center" id="plan">
			<div className="w-[300px] md:w-[350px] bg-white border rounded-full flex p-1">
				<p
					className={`flex-1 text-center p-2 ${
						type === "monthly" &&
						"rounded-full text-white font-semibold bg-blue-500 transition ease-linear"
					} cursor-pointer`}
					onClick={() => {
						setType("monthly");
					}}
				>
					Monthly
				</p>
				<p
					className={`flex-1 text-center p-2 ${
						type === "yearly" &&
						"rounded-full text-white font-semibold bg-blue-500 transition ease-linear"
					} cursor-pointer`}
					onClick={() => {
						setType("yearly");
					}}
				>
					Yearly(save 20%)
				</p>
			</div>

			<div className="space-y-4 md:space-y-0 md:flex md:gap-6 w-full lg:px-10 px-6">
				<Card
					plan="Personal"
					amount={type === "yearly" ? "₦4,480" : "₦5,600"}
					yearFees={type === "yearly" ? "₦53,760" : "₦67,200"}
					per={type === "monthly" ? "Month" : "Year"}
					val="Unlimited Inventory"
					users="2 User"
				/>
				<Card
					plan="Team"
					amount={type === "yearly" ? "₦7,280" : "₦9,100"}
					yearFees={type === "yearly" ? "₦87,360" : "₦109,200"}
					per={type === "monthly" ? "Month" : "Year"}
					val="Unlimited Inventory"
					users="Up to 5 users"
					supplier
					supplierText="Supplier's information"
				/>
				<Card
					plan="Enterprise"
					amount={type === "yearly" ? "₦9,040" : "₦11,300"}
					yearFees={type === "yearly" ? "₦108,480" : "₦135,600"}
					per={type === "monthly" ? "Month" : "Year"}
					val="Unlimited Inventory"
					users="Up to 10 users"
					supplier
					supplierText="Supplier's information"
					customer
					customerText="Customer's and Creditor's information"
				/>
			</div>
		</div>
	);
};
