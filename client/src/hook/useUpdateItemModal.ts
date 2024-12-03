import { create } from "zustand";

interface UpdateItemModalStore {
	isOpen: boolean;
	onOpen: (serialNo: string) => void;
	onClose: () => void;
	serialNo: string | null;
}

const useUpdateItemModal = create<UpdateItemModalStore>(set => ({
	isOpen: false,
	serialNo: null,
	onOpen: (serialNo: string) => set({ isOpen: true, serialNo: serialNo }),
	onClose: () => set({ isOpen: false, serialNo: null }),
}));

export default useUpdateItemModal;
