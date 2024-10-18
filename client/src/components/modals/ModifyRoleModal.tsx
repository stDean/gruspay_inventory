"use client";

import { updateUserRole } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { useReduxState } from "@/hook/useRedux";
import useModifyRoleModal from "@/hook/useUpdateRoleModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomSelect } from "../auth/CustomSelect";
import { Modal } from "./Modal";

export const ModifyRoleModal = () => {
	const modifyModal = useModifyRoleModal();
	const { token } = useReduxState();
	const [role, setRole] = useState(modifyModal!.user!?.role!);

	useEffect(() => {
		setRole(modifyModal!.user!?.role!);
	}, [modifyModal.isOpen]);

	const headerContent = (
		<>
			<h1 className="text-xl font-semibold text-black">Modify User Role</h1>
		</>
	);

	const handleUpdate = async (id: string) => {
		const { error } = await updateUserRole({ token, id, role });

		if (error) {
			toast.error("Error", { description: error });
			return;
		}

		toast.success("Success", {
			description: "User role updated successfully",
		});

		modifyModal.onClose();
	};

	const bodyContent = (
		<>
			<div className="flex items-center p-6 w-full gap-4">
				<div className="flex-1">
					<p className="text-sm font-semibold">First Name</p>
					<Input disabled value={modifyModal!.user!?.first_name} />
				</div>

				<div className="flex-1">
					<p className="text-sm font-semibold">First Name</p>
					<Input disabled value={modifyModal!.user!?.last_name} />
				</div>
			</div>

			<div className="flex items-center p-6 pt-2 w-full  gap-4">
				<div className="flex-1">
					<p className="text-sm font-semibold">Email</p>
					<Input disabled value={modifyModal!.user!?.email} />
				</div>

				<div className="flex-1">
					<p className="text-sm font-semibold">Role</p>
					<CustomSelect
						label="Role"
						items={
							<>
								{["EMPLOYEE", "ADMIN"].map(type => (
									<SelectItem value={type} key={type} className="capitalize">
										{type.toLowerCase()}
									</SelectItem>
								))}
							</>
						}
						handleChange={(value: string) => setRole(value)}
						value={role}
					/>
				</div>
			</div>

			<hr />

			<div className="px-6 py-4 flex justify-end">
				<Button onClick={() => handleUpdate(modifyModal!.user!?.id!)}>
					Update Role
				</Button>
			</div>
		</>
	);

	return (
		<Modal
			isOpen={modifyModal.isOpen}
			onClose={modifyModal.onClose}
			headerContent={headerContent}
			body={bodyContent}
		/>
	);
};
