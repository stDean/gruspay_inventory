import { create } from "zustand";

interface showProductModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useShowProductModal = create<showProductModalStore>(set => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useShowProductModal;
