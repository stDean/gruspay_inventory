"use client";

import { BillingPlanType, cn } from "@/lib/utils";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import { Check } from "lucide-react";

interface PlanButtonsProps {
	options: { billingPlan: (typeof BillingPlanType.options)[number] };
	onChange: (value: (typeof BillingPlanType.options)[number]) => void;
}

export const PlanButtons = ({ options, onChange }: PlanButtonsProps) => {
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
															options.billingPlan["title"] === option.title,
													}
												)}
											>
												<Check
													className={cn("h-3 w-3 text-gray-400", {
														"text-[#F9AE19]":
															options.billingPlan["title"] === option.title,
													})}
													strokeWidth={3}
												/>
											</span>
										</div>

										<div className="h-[1.5px] w-full bg-zinc-200 my-2" />

										<Description className="px-6 mb-1">
											<span className="text-2xl lg:text-4xl font-semibold">
												{option.amount}
											</span>{" "}
											per month
										</Description>
										<Description className="px-6">
											{option.subTitle}
										</Description>
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
