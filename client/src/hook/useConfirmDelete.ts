import { create } from "zustand";

interface ConfirmDeleteModalStore {
	isOpen: boolean;
	onOpen: (serialNo: string) => void;
	onClose: () => void;
	serialNo: string | null;
}

const useConfirmDeleteModal = create<ConfirmDeleteModalStore>(set => ({
	isOpen: false,
	serialNo: null,
	onOpen: (serialNo: string) => set({ isOpen: true, serialNo: serialNo }),
	onClose: () => set({ isOpen: false, serialNo: null }),
}));

export default useConfirmDeleteModal;
