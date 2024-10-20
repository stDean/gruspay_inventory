"use client";

import useCancelPlanModal from "@/hook/useCancelPlanModal";
import { Modal } from "./Modal";
import { Button } from "@/components/ui/button";
import { cancelCompanyPlan, getUser } from "@/actions/user";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { useReduxState } from "@/hook/useRedux";
import { setUser } from "@/state";
import { useAppDispatch } from "@/app/redux";

export const CancelPlanModal = () => {
	const dispatch = useAppDispatch();
	const cancelModal = useCancelPlanModal();
	const [isPending, startTransition] = useTransition();
	const { token, user } = useReduxState();

	const setUserState = useCallback(async () => {
		const { data } = await getUser({ token });
		dispatch(setUser(data.userInDb));
	}, [token, user]);

	const handleCancelPlan = () => {
		startTransition(async () => {
			const { error } = await cancelCompanyPlan({ token });
			if (error) {
				toast.error("Error", { description: error });
				return;
			}

			toast.success("Success", {
				description: "Your subscription has been successfully canceled.",
			});
			setUserState();
			cancelModal.onClose();
		});
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Cancel Subscription</h1>
		</>
	);

	const bodyContent = (
		<div className="p-6">
			<p className="text-base text-gray-500">
				Are you sure you want to cancel your subscription?
			</p>

			<div className="flex gap-4 mt-6 border-t pt-4">
				<Button
					onClick={() => {
						setTimeout(() => {
							cancelModal.onClose();
						}, 300);
					}}
					variant="outline"
				>
					Cancel
				</Button>
				<Button disabled={isPending} onClick={handleCancelPlan}>
					Confirm
				</Button>
			</div>
		</div>
	);

	return (
		<Modal
			isOpen={cancelModal.isOpen}
			onClose={cancelModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
