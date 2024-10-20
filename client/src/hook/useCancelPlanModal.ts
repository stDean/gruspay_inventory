import { create } from "zustand";

interface CancelPlanModalStore {
  isOpen: boolean;
  onOpen: (data: { payment_plan: string; billingType: string }) => void;
  onClose: () => void;
  data: { payment_plan: string; billingType: string } | null;
}

const useCancelPlanModal = create<CancelPlanModalStore>(set => ({
  isOpen: false,
	data: null,
	onOpen: (data: { payment_plan: string; billingType: string }) =>
		set({ isOpen: true, data: data }),
	onClose: () => set({ isOpen: false, data: null }),
}));

export default useCancelPlanModal;
