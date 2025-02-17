"use client";

import { BillingPlanType } from "@/lib/utils";
import { PlanButtons } from "@/components/Plan";

interface BillingProps {
	options: { billingPlan: (typeof BillingPlanType.options)[number] };
	onChange: (value: (typeof BillingPlanType.options)[number]) => void;
	type: string;
	plan?: string;
	sendPlanAndType: () => { billingType: string };
}

export const Billing = ({
	options,
	onChange,
	type,
	plan,
	sendPlanAndType,
}: BillingProps) => {
	return (
		<div className="lg:w-[70vw]">
			<PlanButtons
				options={options}
				onChange={onChange}
				type={type}
				plan={plan}
				sendPlanAndType={sendPlanAndType}
			/>
		</div>
	);
};
