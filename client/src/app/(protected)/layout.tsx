import DashboardWrapper from "@/app/DashboardWrapper";
import { AddMultipleProductsModal } from "@/components/modals/AddMultipleProductsModal";
import { AddProductsModal } from "@/components/modals/AddProductsModal";
import { AddSingleProductModal } from "@/components/modals/AddSingleProductModal";
import { ShowProductModal } from "@/components/modals/ShowProductModal";
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
			<DashboardWrapper>{children}</DashboardWrapper>
		</>
	);
}
