import { create } from "zustand";

interface ShowPolicyModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useShowPolicyModal = create<ShowPolicyModal>(set => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useShowPolicyModal;
