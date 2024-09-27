import { ProductProps } from "@/lib/types";
import { create } from "zustand";

interface SwapProductDetailModalStore {
  isOpen: boolean;
  product: ProductProps | null;
  onOpen: (val: ProductProps) => void;
  onClose: () => void;
}

const useSwapProductDetailModal = create<SwapProductDetailModalStore>(set => ({
  isOpen: false,
  product: null,
  onOpen: (val: ProductProps) => set({ isOpen: true, product: val}),
  onClose: () => set({ isOpen: false, product: null }),
}));

export default useSwapProductDetailModal;
