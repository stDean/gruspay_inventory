"use client";

import useUpdatePlanModal from "@/hook/useUpdatePlanModal";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { getUser, updateCompanyPlan } from "@/actions/user";
import { useReduxState } from "@/hook/useRedux";
import { setUser } from "@/state";
import { useAppDispatch } from "@/app/redux";

export const UpdatePlanModal = () => {
	const dispatch = useAppDispatch();
	const updateModal = useUpdatePlanModal();
	const [isPending, startTransition] = useTransition();
	const { token, user } = useReduxState();

	const setUserState = useCallback(async () => {
		const { data } = await getUser({ token });
		dispatch(setUser(data.userInDb));
	}, [token, user]);

	const handleUpdate = () => {
		startTransition(async () => {
			console.log({ d: updateModal.data });
			const { error } = await updateCompanyPlan({
				token,
				payment_plan: updateModal?.data?.payment_plan.toUpperCase() as string,
				billingType: updateModal?.data?.billingType as string,
			});

			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			toast.success("Success", {
				description:
					"Subscription updated. Your plan will change when the current one expires.",
			});
			setUserState();
			updateModal.onClose();
		});
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Update Plan</h1>
		</>
	);

	const bodyContent = (
		<div className="p-6">
			<p className="text-base text-gray-500">
				Are you sure you want to update your plan?
			</p>

			<div className="flex gap-4 mt-6 border-t pt-4">
				<Button
					onClick={() => {
						setTimeout(() => {
							updateModal.onClose();
						}, 300);
					}}
					variant="outline"
				>
					Cancel
				</Button>
				<Button onClick={handleUpdate} disabled={isPending}>
					Confirm
				</Button>
			</div>
		</div>
	);

	return (
		<Modal
			isOpen={updateModal.isOpen}
			onClose={updateModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
