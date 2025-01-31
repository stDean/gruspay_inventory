"use client";

import { Button } from "@/components/ui/button";
import useCancelPlanModal from "@/hook/useCancelPlanModal";
import useCanReactivateModal from "@/hook/useCanReactivateModal";
import { useReduxState } from "@/hook/useRedux";
import useUpdatePlanModal from "@/hook/useUpdatePlanModal";
import { BillingPlanType, cn } from "@/lib/utils";
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import { Check } from "lucide-react";

interface PlanButtonsProps {
	options: { billingPlan: (typeof BillingPlanType.options)[number] };
	onChange: (value: (typeof BillingPlanType.options)[number]) => void;
	type: string;
	plan?: string;
	sendPlanAndType: () => { billingType: string };
}

export const PlanButtons = ({
	options,
	onChange,
	type,
	plan,
	sendPlanAndType,
}: PlanButtonsProps) => {
	const { companyDetails } = useReduxState();
	const cancelModal = useCancelPlanModal();
	const updateModal = useUpdatePlanModal();
	const reactivateModal = useCanReactivateModal();

	const matcher: { [key: string]: string } = {
		MONTHLY: "monthly",
		YEARLY: "yearly",
	};
	const matchVal = companyDetails?.billingType;

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
															type === matcher[matchVal as string],
													}
												)}
											>
												<Check
													className={cn("h-3 w-3 text-gray-400", {
														"text-[#F9AE19]":
															options.billingPlan?.title === option.title &&
															type === matcher[matchVal as string],
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
												<Description className="px-6 text-xs md:text-sm">
													{option.subTitle}
												</Description>
											</div>

											<div className="self-end pr-4 md:pr-8">
												<Button
													className="px-4 md:px-5 text-xs md:text-sm"
													variant={
														option.title === plan &&
														type === matcher[matchVal as string]
															? "outline"
															: "default"
													}
													onClick={
														companyDetails?.paymentStatus === "INACTIVE"
															? () => {
																	const res = sendPlanAndType();
																	console.log(
																		`Reactivating account with payment_plan: ${option.title} and billing_type: ${res.billingType}`
																	);
																	reactivateModal.onOpen({
																		payment_plan: option.title,
																		billingType: res.billingType,
																	});
															  }
															: option.title === plan &&
															  type === matcher[matchVal as string]
															? () => {
																	const res = sendPlanAndType();
																	cancelModal.onOpen({
																		payment_plan: option.title,
																		billingType: res.billingType,
																	});
															  }
															: () => {
																	const res = sendPlanAndType();
																	updateModal.onOpen({
																		payment_plan: option.title,
																		billingType: res.billingType,
																	});
															  }
													}
													disabled={
														(option.title === plan &&
															type === matcher[matchVal as string] &&
															!companyDetails?.cancelable) ||
														!companyDetails?.canUpdate
													}
												>
													{companyDetails?.paymentStatus === "INACTIVE"
														? "Choose Plan"
														: option.title === plan &&
														  type === matcher[matchVal as string]
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
