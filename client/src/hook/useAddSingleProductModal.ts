import { create } from "zustand";

interface AddSingleProductModalStore {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
}

const useAddSingleProductModal = create<AddSingleProductModalStore>(set => ({
	isOpen: false,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false }),
}));

export default useAddSingleProductModal;
