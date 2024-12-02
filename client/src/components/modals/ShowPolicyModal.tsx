"use client";

import { Modal } from "@/components/modals/Modal";
import useShowPolicyModal from "@/hook/useShowPolicyModal";
import { Policy } from "../Policy";

export const ShowPolicyModal = () => {
	const showPolicy = useShowPolicyModal();

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Cauntr Policy</h1>
		</>
	);

	return (
		<Modal
			isOpen={showPolicy.isOpen}
			onClose={() => {
				setTimeout(() => {
					showPolicy.onClose();
				}, 300);
			}}
			headerContent={headerContent}
			body={<Policy />}
			onSubmit={() => {}}
			addStyle2
		/>
	);
};
