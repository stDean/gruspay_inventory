import DashboardWrapper from "@/app/DashboardWrapper";
import { AddMultipleProductsModal } from "@/components/modals/AddMultipleProductsModal";
import { AddProductsModal } from "@/components/modals/AddProductsModal";
import { AddSingleProductModal } from "@/components/modals/AddSingleProductModal";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { ShowProductModal } from "@/components/modals/ShowProductModal";
import { SoldDetailModal } from "@/components/modals/SoldDetailModal";
import { SwapProductModal } from "@/components/modals/SwapProductModal";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<AddProductsModal />
			<AddSingleProductModal />
			<AddMultipleProductsModal />
			<ShowProductModal />
			<SwapProductModal />
			<AddUserModal />
      <SoldDetailModal />
			<DashboardWrapper>{children}</DashboardWrapper>
		</>
	);
}
