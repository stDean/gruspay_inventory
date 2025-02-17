import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import StoreProvider from "./redux";
import { constructMetadata } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = constructMetadata();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="!scroll-smooth">
			<body className={`${inter.className} antialiased`}>
				<StoreProvider>
					{children}

					<Toaster position="bottom-right" richColors />
				</StoreProvider>
			</body>
		</html>
	);
}
