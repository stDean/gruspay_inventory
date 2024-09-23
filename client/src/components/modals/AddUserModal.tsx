"use client";

import useAddUserModal from "@/hook/useAddUserModal";
import { Modal } from "./Modal";
import { AddUser } from "@/components/auth/AddUser";

export const AddUserModal = () => {
	const userModal = useAddUserModal();
	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Add New User</h1>
		</>
	);

	return (
		<Modal
			isOpen={userModal.isOpen}
			onClose={userModal.onClose}
			headerContent={headerContent}
			body={<AddUser />}
		/>
	);
};
