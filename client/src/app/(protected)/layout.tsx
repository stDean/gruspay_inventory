import DashboardWrapper from "@/app/DashboardWrapper";
import { AddMultipleProductsModal } from "@/components/modals/AddMultipleProductsModal";
import { AddProductsModal } from "@/components/modals/AddProductsModal";
import { AddSingleProductModal } from "@/components/modals/AddSingleProductModal";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { CancelPlanModal } from "@/components/modals/CancelPlanModal";
import { CompletePayModal } from "@/components/modals/CompletePayModal";
import { ConfirmDeleteItemModel } from "@/components/modals/ConfirmDeleteItem";
import { ModifyRoleModal } from "@/components/modals/ModifyRoleModal";
import { ShowProductModal } from "@/components/modals/ShowProductModal";
import { SoldDetailModal } from "@/components/modals/SoldDetailModal";
import { SwapDetailModal } from "@/components/modals/SwapDetailModal";
import { SwapProductModal } from "@/components/modals/SwapProductModal";
import { UpdateItemModal } from "@/components/modals/UpdateItemModal";
import { UpdatePlanModal } from "@/components/modals/UpdatePlanModal";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<>
				<AddProductsModal />
				<AddSingleProductModal />
				<AddMultipleProductsModal />
				<ShowProductModal />
				<SwapProductModal />
				<AddUserModal />
				<SoldDetailModal />
				<SwapDetailModal />
				<ModifyRoleModal />
				<CompletePayModal />
				<CancelPlanModal />
				<UpdatePlanModal />
				<ConfirmDeleteItemModel />
				<UpdateItemModal />
			</>
			<DashboardWrapper>{children}</DashboardWrapper>
		</>
	);
}
