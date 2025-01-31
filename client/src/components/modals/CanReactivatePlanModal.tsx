"use client";

import { cancelCompanyPlan, reactivateCompanyPlan } from "@/actions/user";
import { useAppDispatch } from "@/app/redux";
import { Button } from "@/components/ui/button";
import useCanReactivateModal from "@/hook/useCanReactivateModal";
import { useReduxState } from "@/hook/useRedux";
import { fetchUser } from "@/lib/utils";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "./Modal";

export const CanReactivatePlanModal = () => {
	const dispatch = useAppDispatch();
	const reactivateModal = useCanReactivateModal();
	const [isPending, startTransition] = useTransition();
	const { token } = useReduxState();

	const setUserState = useCallback(async () => {
		await fetchUser(token, dispatch);
	}, []);

	const handleReactivatePlan = () => {
		startTransition(async () => {
			// const res = await reactivateCompanyPlan({
			// 	token,
			// 	payment_plan: reactivateModal?.data?.payment_plan.toUpperCase() as string,
			// 	billingType: reactivateModal?.data?.billingType as string,
			// 	billingPrice: reactivateModal?.data?.price as string,
			// });

      // if (res?.error) {
      //   toast.error("Error", { description: res?.error });
      //   return;
      // }

			console.log({ a: reactivateModal.data });
			toast.success("Success", {
				description: "Your subscription has been successfully reactivated.",
			});
			setUserState();
			reactivateModal.onClose();
		});
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">
				Reactivate Subscription
			</h1>
		</>
	);

	const bodyContent = (
		<div className="p-6">
			<p className="text-base text-gray-500">
				Are you sure you want to choose this subscription plan?
			</p>

			<div className="flex gap-4 mt-6 border-t pt-4">
				<Button
					onClick={() => {
						setTimeout(() => {
							reactivateModal.onClose();
						}, 300);
					}}
					variant="outline"
				>
					Cancel
				</Button>
				<Button disabled={isPending} onClick={handleReactivatePlan}>
					Confirm
				</Button>
			</div>
		</div>
	);

	return (
		<Modal
			isOpen={reactivateModal.isOpen}
			onClose={reactivateModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
