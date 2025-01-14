import { ProductProps } from "@/lib/types";
import { create } from "zustand";

interface CompletePayModalStore {
	isOpen: boolean;
	product: ProductProps | null;
	dates: { date: string; pricePaid: string }[] | null;
	onOpen: (
		val: ProductProps,
		dates: { date: string; pricePaid: string }[]
	) => void;
	onClose: () => void;
}

const useCompletePayModal = create<CompletePayModalStore>(set => ({
	isOpen: false,
	product: null,
	dates: null,
	onOpen: (val: ProductProps, dates: { date: string; pricePaid: string }[]) =>
		set({ isOpen: true, product: val, dates: dates }),
	onClose: () => set({ isOpen: false, product: null, dates: null }),
}));

export default useCompletePayModal;
