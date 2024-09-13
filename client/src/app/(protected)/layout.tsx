import DashboardWrapper from "@/app/DashboardWrapper";
import { AddProductsModal } from "@/components/modals/AddProductsModal";
import { AddSingleProductModal } from "@/components/modals/AddSingleproductModal";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<AddProductsModal />
      <AddSingleProductModal />
			<DashboardWrapper>{children}</DashboardWrapper>
		</>
	);
}
