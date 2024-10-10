"use client";

import { BillingPlanType } from "@/lib/utils";
import { PlanButtons } from "./Plan";

interface BillingProps {
	options: { billingPlan: (typeof BillingPlanType.options)[number] };
	onChange: (value: (typeof BillingPlanType.options)[number]) => void;
  type: string
}

export const Billing = ({ options, onChange, type }: BillingProps) => {
	return (
		<div className="lg:w-[70vw]">
			<PlanButtons options={options} onChange={onChange} type={type} />
		</div>
	);
};
