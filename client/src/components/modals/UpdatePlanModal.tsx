"use client";

import { updateCompanyPlan } from "@/actions/user";
import { useAppDispatch } from "@/app/redux";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useReduxState } from "@/hook/useRedux";
import useUpdatePlanModal from "@/hook/useUpdatePlanModal";
import { fetchUser } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";

export const UpdatePlanModal = () => {
	const dispatch = useAppDispatch();
	const updateModal = useUpdatePlanModal();
	const [isPending, startTransition] = useTransition();
	const { token } = useReduxState();
	const router = useRouter();

	const setUserState = useCallback(async () => {
		await fetchUser(token, dispatch);
	}, []);

	const handleUpdate = () => {
		startTransition(async () => {
			const res = await updateCompanyPlan({
				token,
				payment_plan: updateModal?.data?.payment_plan.toUpperCase() as string,
				billingType: updateModal?.data?.billingType as string,
			});

			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}

			if (res?.data?.transaction) {
				router.push(res?.data?.transaction?.authorization_url);
        toast.success("Success", { description: "Redirecting to payment page" });
				updateModal.onClose();
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
