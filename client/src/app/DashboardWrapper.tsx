"use client";

import { ReactNode, useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { SideBar } from "@/components/SideBar";
import StoreProvider, { useAppSelector } from "./redux";

const DashBoardLayout = ({ children }: { children: ReactNode }) => {
	const { isDarkMode, isSidebarCollapsed, loggedInUser } = useAppSelector(
		({ global }) => global
	);

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.add("light");
		}
	});

	return (
		<div
			className={`${
				isDarkMode ? "dark" : "light"
			} flex bg-gray-50 text-gray-900 w-full min-h-screen`}
		>
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
