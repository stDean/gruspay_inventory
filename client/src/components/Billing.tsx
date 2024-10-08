"use client";

import { BillingPlanType } from "@/lib/utils";
import { PlanButtons } from "./Plan";

interface BillingProps {
	options: { billingPlan: (typeof BillingPlanType.options)[number] };
	onChange: (value: (typeof BillingPlanType.options)[number]) => void;
}

export const Billing = ({ options, onChange }: BillingProps) => {
	return (
		<div className="lg:w-[70vw]">
			<PlanButtons options={options} onChange={onChange} />
		</div>
	);
};