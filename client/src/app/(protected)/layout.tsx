import DashboardWrapper from "@/app/DashboardWrapper";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <DashboardWrapper>{children}</DashboardWrapper>;
}
