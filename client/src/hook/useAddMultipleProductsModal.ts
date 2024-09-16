import { create } from "zustand";

interface AddMultipleProductModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useAddMultipleProductModal = create<AddMultipleProductModalStore>(set => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useAddMultipleProductModal;
