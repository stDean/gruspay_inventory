"use client";

import { NavBar } from "@/components/NavBar";
import { SideBar } from "@/components/SideBar";
import { UseReduxState } from "@/hook/useRedux";
import { ReactNode } from "react";

const DashBoardLayout = ({ children }: { children: ReactNode }) => {
	const { isSidebarCollapsed } = UseReduxState();

	return (
		<div className={` flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
			<SideBar />
			<main
				className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${
					isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
				}`}
			>
				<NavBar />
				{children}
			</main>
		</div>
	);
};

export default function DashboardWrapper({
	children,
}: {
	children: ReactNode;
}) {
	return <DashBoardLayout>{children}</DashBoardLayout>;
}
