"use client";

import { cancelCompanyPlan } from "@/actions/user";
import { Button } from "@/components/ui/button";
import useCancelPlanModal from "@/hook/useCancelPlanModal";
import { useReduxState } from "@/hook/useRedux";
import { fetchUser } from "@/lib/utils";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "./Modal";
import { useAppDispatch } from "@/app/redux";

export const CancelPlanModal = () => {
	const dispatch = useAppDispatch();
	const cancelModal = useCancelPlanModal();
	const [isPending, startTransition] = useTransition();
	const { token } = useReduxState();

	const setUserState = useCallback(async () => {
		await fetchUser(token, dispatch);
	}, []);

	const handleCancelPlan = () => {
		startTransition(async () => {
			const res = await cancelCompanyPlan({ token });
			if (res?.error) {
				toast.error("Error", { description: res?.error });
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
