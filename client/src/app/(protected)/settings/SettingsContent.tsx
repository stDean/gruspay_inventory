"use client";

import { getUser, updateCompanyPlan } from "@/actions/user";
import { useAppDispatch } from "@/app/redux";
import { UserSettingsForm } from "@/components/auth/UserSettingsForm";
import { Billing } from "@/components/Billing";
import { Tab } from "@/components/Tab";
import { Button } from "@/components/ui/button";
import { useReduxState } from "@/hook/useRedux";
import { BillingPlanType } from "@/lib/utils";
import { setUser } from "@/state";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

enum Plans {
	"Personal" = 0,
	"Team" = 1,
	"Enterprise" = 2,
}

export const SettingsContent = () => {
	const dispatch = useAppDispatch();
	const { token, user, companyDetails } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [tab, setTab] = useState<{
		billing: boolean;
		security: boolean;
	}>({ billing: true, security: false });
	const [billingType, setBillingType] = useState<"monthly" | "yearly">(
		"monthly"
	);

	// Normalize the plan to lowercase and find the matching key from the enum
	const planKey = Object.keys(Plans)
		.filter(key => isNaN(Number(key))) // Filter out numeric values from enum
		.find(key =>
			key
				.toLowerCase()
				.includes(companyDetails?.CompanyPayments?.plan!?.toLowerCase())
		);

	// Get the corresponding index (numeric value) of the plan from the enum
	const planIndex = planKey ? Plans[planKey as keyof typeof Plans] : undefined;

	const [options, setOptions] = useState<{
		billingPlan: (typeof BillingPlanType.options)[number];
	}>({ billingPlan: BillingPlanType.options[planIndex!] });

	const handleChange = (val: (typeof BillingPlanType.options)[number]) => {
		setOptions(prev => ({
			...prev,
			billingPlan: val,
		}));
	};

	// re fetch user
	const setUserState = useCallback(async () => {
		const { data } = await getUser({ token });
		dispatch(setUser(data.userInDb));
	}, [token, user]);

	const matchers = {
		Personal: "PERSONAL",
		Team: "TEAM",
		Enterprise: "ENTERPRISE",
	};

	const handleUpdate = () => {
		console.log({
			payment_plan: matchers[options.billingPlan.title].toUpperCase(),
			billingType: billingType.toUpperCase(),
		});
		return;

		startTransition(async () => {
			const { data, error } = await updateCompanyPlan({
				token,
				payment_plan: matchers[options.billingPlan.title].toUpperCase(),
				billingType: billingType.toUpperCase(),
			});

			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			toast.success("Success", { description: data.msg });
			setUserState();
		});
	};

	console.log({ options, billingType });

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between items-center">
				<div className="space-y-3 w-full">
					<div className="flex justify-between items-center">
						<h1 className="font-semibold text-xl md:text-2xl">Settings</h1>
					</div>

					<div className="space-y-4">
						<div className="flex text-xs bg-white text-[#344054] rounded-md border border-[#D0D5DD] cursor-pointer items-center w-fit">
							<Tab
								first
								title="Billing & Plan"
								handleTab={() => {
									setTab({
										billing: true,
										security: false,
									});
								}}
								val={tab.billing}
								styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r rounded-l-md"
							/>
							<Tab
								title="Security"
								handleTab={() => {
									setTab({
										billing: false,
										security: true,
									});
								}}
								val={tab.security}
								styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] rounded-r-md"
							/>
						</div>

						{tab.billing && (
							<div className="max-w-[150px] bg-white border rounded-full flex p-1">
								<p
									className={`flex-1 text-center p-[0.5px] ${
										billingType === "monthly" &&
										"rounded-full text-white bg-blue-500 transition ease-linear"
									} cursor-pointer`}
									onClick={() => {
										setBillingType("monthly");
									}}
								>
									Monthly
								</p>
								<p
									className={`flex-1 text-center p-[0.5px] ${
										billingType === "yearly" &&
										"rounded-full text-white bg-blue-500 transition ease-linear"
									} cursor-pointer`}
									onClick={() => {
										setBillingType("yearly");
									}}
								>
									Yearly
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{tab.security && <UserSettingsForm />}
			{tab.billing && (
				<Billing
					options={options}
					onChange={handleChange}
					type={billingType}
					plan={planKey}
					handleClick={handleUpdate}
				/>
			)}
		</div>
	);
};
