"use client";

import { deleteProduct } from "@/actions/inventory";
import { Button } from "@/components/ui/button";
import useConfirmDeleteModal from "@/hook/useConfirmDelete";
import { useReduxState } from "@/hook/useRedux";
import { useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "./Modal";

export const ConfirmDeleteItemModel = () => {
	const confirmDeleteModal = useConfirmDeleteModal();
	const [isPending, startTransition] = useTransition();
	const { token } = useReduxState();

	const deleteProd = (serialNo: string) => {
		startTransition(async () => {
			const res = await deleteProduct({ token, serialNo });

			if (res?.error) {
				toast.error("Error", {
					description: res?.error,
				});
				return;
			}

      confirmDeleteModal.onClose();
			toast.success("Success", { description: "Product has been deleted" });
		});
	};

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Delete Item</h1>
		</>
	);

	const bodyContent = (
		<div className="p-6">
			<p className="text-base text-gray-500">
				Are you sure you want to delete item with serial no:{" "}
				{confirmDeleteModal?.serialNo}?
			</p>

			<div className="flex gap-4 mt-6 border-t pt-4">
				<Button
					onClick={() => {
						setTimeout(() => {
							confirmDeleteModal.onClose();
						}, 300);
					}}
					variant="outline"
				>
					Cancel
				</Button>
				<Button
					disabled={isPending}
					onClick={() => deleteProd(confirmDeleteModal?.serialNo as string)}
					className="bg-red-400 hover:bg-red-500"
				>
					Confirm
				</Button>
			</div>
		</div>
	);

	return (
		<Modal
			isOpen={confirmDeleteModal.isOpen}
			onClose={confirmDeleteModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
			onSubmit={() => {}}
		/>
	);
};
