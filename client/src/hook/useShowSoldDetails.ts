import { ProductProps } from "@/lib/types";
import { create } from "zustand";

interface ShowSoldInfoModalStore {
  isOpen: boolean;
  product: ProductProps | null;
  onOpen: (val: ProductProps) => void;
  onClose: () => void;
}

const useShowSoldInfoModal = create<ShowSoldInfoModalStore>(set => ({
  isOpen: false,
  product: null,
  onOpen: (val: ProductProps) => set({ isOpen: true,  product: val}),
  onClose: () => set({ isOpen: false, product: null }),
}));

export default useShowSoldInfoModal;
