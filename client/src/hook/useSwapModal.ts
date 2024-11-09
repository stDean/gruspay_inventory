import { create } from "zustand";

export interface ItemProps {
	product_name: string;
	brand: string;
	serial_no: string;
}

interface swapProductModalStore {
	isOpen: boolean;
	items: ItemProps[];
	onOpen: (item: ItemProps) => void;
	onClose: () => void;
	removeItem: (serial_no: string) => void;
	addItem: (item: ItemProps) => void;
}

const useSwapProductModal = create<swapProductModalStore>((set, get) => ({
	isOpen: false,
	items: [],
	onOpen: (item: ItemProps) =>
		set({ items: [...get().items, item], isOpen: true }),
	onClose: () => set({ isOpen: false, items: [] }),
	removeItem: (serial_no: string) =>
		set({
			items: get().items.filter(
				(item: ItemProps) => item.serial_no !== serial_no
			),
			isOpen: true,
		}),
	addItem: (item: ItemProps) =>
		set(() => ({
			isOpen: true,
			items: [item],
		})),
}));

export default useSwapProductModal;
