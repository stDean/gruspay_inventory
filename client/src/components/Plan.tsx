"use client";

import { useReduxState } from "@/hook/useRedux";
import { BillingPlanType, cn } from "@/lib/utils";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanButtonsProps {
	options: { billingPlan: (typeof BillingPlanType.options)[number] };
	onChange: (value: (typeof BillingPlanType.options)[number]) => void;
	type: string;
	plan?: string;
	handleClick: () => void;
	isPending?: boolean;
	handleCancelPlan: () => void;
}

export const PlanButtons = ({
	options,
	onChange,
	type,
	plan,
	handleClick,
	isPending,
	handleCancelPlan,
}: PlanButtonsProps) => {
	const { companyDetails } = useReduxState();
	const matcher: { [key: string]: string } = {
		MONTHLY: "monthly",
		YEARLY: "yearly",
	};
	const matchVal = companyDetails!.billingType!;

	return (
		<>
			{[BillingPlanType].map(({ name, options: selectedOptions }) => (
				<RadioGroup value={options[name]} onChange={onChange} key={name}>
					<div className="mt-3 space-y-4">
						{selectedOptions.map(option => (
							<Radio
								key={option.title}
								value={option}
								className={({ checked }) =>
									cn(
										"relative block cursor-pointer rounded-lg bg-white py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between",
										{
											"border-[#F9AE19] bg-[#FEFDF0]": checked,
										}
									)
								}
							>
								<div className="flex items-center justify-between w-full">
									<div className="flex flex-col text-sm w-full">
										<div className="flex justify-between w-full px-6">
											<Label className="font-semibold text-gray-900" as="span">
												{option.title}
											</Label>

											<span
												className={cn(
													"border-2 rounded-full p-[2px] self-start flex items-center justify-center",
													{
														"border-[#F9AE19]":
															options.billingPlan?.title === option.title &&
															type === matcher[matchVal],
													}
												)}
											>
												<Check
													className={cn("h-3 w-3 text-gray-400", {
														"text-[#F9AE19]":
															options.billingPlan?.title === option.title &&
															type === matcher[matchVal],
													})}
													strokeWidth={3}
												/>
											</span>
										</div>

										<div className="h-[1.5px] w-full bg-zinc-200 my-2" />

										<div className="flex justify-between">
											<div>
												<Description className="px-6 mb-1">
													<span className="text-2xl lg:text-4xl font-semibold">
														{type === "monthly"
															? option.amount
															: option.yrAmount}
													</span>{" "}
													per month
												</Description>
												<Description className="px-6 mb-1">
													<span className="font-semibold text-base">
														{type === "monthly"
															? option.amountPY
															: option.yrAmountPY}
													</span>{" "}
													per year
												</Description>
												<Description className="px-6">
													{option.subTitle}
												</Description>
											</div>

											<div className="self-end pr-4 md:pr-8">
												<Button
													className=""
													variant={
														option.title === plan && type === matcher[matchVal]
															? "outline"
															: "default"
													}
													onClick={
														option.title === plan && type === matcher[matchVal]
															? handleCancelPlan
															: handleClick
													}
													disabled={
														(option.title === plan &&
															type === matcher[matchVal] &&
															!companyDetails?.cancelable) ||
														isPending ||
														!companyDetails?.canUpdate
													}
												>
													{option.title === plan && type === matcher[matchVal]
														? "Cancel Subscription"
														: "Upgrade Plan"}
												</Button>
											</div>
										</div>
									</div>
								</div>
							</Radio>
						))}
					</div>
				</RadioGroup>
			))}
		</>
	);
};
