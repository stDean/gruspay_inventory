import { ProductProps } from "@/lib/types";
import { create } from "zustand";

interface CompletePayModalStore {
  isOpen: boolean;
  product: ProductProps | null;
  onOpen: (val: ProductProps) => void;
  onClose: () => void;
}

const useCompletePayModal = create<CompletePayModalStore>(set => ({
  isOpen: false,
  product: null,
  onOpen: (val: ProductProps) => set({ isOpen: true,  product: val}),
  onClose: () => set({ isOpen: false, product: null }),
}));

export default useCompletePayModal;
