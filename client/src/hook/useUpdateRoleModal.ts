import { UserProps } from "@/lib/types";
import { create } from "zustand";

interface ModifyRoleModalStore {
	isOpen: boolean;
	user: UserProps | null;
	onOpen: (val: UserProps) => void;
	onClose: () => void;
}

const useModifyRoleModal = create<ModifyRoleModalStore>(set => ({
	isOpen: false,
	user: null,
	onOpen: (val: UserProps) => set({ isOpen: true, user: val }),
	onClose: () => set({ isOpen: false, user: null }),
}));

export default useModifyRoleModal;
