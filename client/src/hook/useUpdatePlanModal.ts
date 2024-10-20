import { create } from "zustand";

interface UpdatePlanModalStore {
	isOpen: boolean;
	onOpen: (data: { payment_plan: string; billingType: string }) => void;
	onClose: () => void;
	data: { payment_plan: string; billingType: string } | null;
}

const useUpdatePlanModal = create<UpdatePlanModalStore>(set => ({
	isOpen: false,
	data: null,
	onOpen: (data: { payment_plan: string; billingType: string }) =>
		set({ isOpen: true, data: data }),
	onClose: () => set({ isOpen: false, data: null }),
}));

export default useUpdatePlanModal;
