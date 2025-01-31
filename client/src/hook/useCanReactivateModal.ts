import { create } from "zustand";

interface CanReactivateModal {
	isOpen: boolean;
	onOpen: (data: {
		payment_plan: string;
		billingType: string;
		price: string;
	}) => void;
	onClose: () => void;
	data: { payment_plan: string; billingType: string; price: string } | null;
}

const useCanReactivateModal = create<CanReactivateModal>(set => ({
	isOpen: false,
	data: null,
	onOpen: (data: {
		payment_plan: string;
		billingType: string;
		price: string;
	}) => set({ isOpen: true, data: data }),
	onClose: () => set({ isOpen: false, data: null }),
}));

export default useCanReactivateModal;
