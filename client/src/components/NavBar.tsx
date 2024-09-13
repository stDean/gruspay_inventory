"use client";

import { useAppDispatch } from "@/app/redux";
import { UseReduxState } from "@/hook/useRedux";
import { setIsSidebarCollapsed } from "@/state";
import { Menu, Settings } from "lucide-react";
import Link from "next/link";

export const NavBar = () => {
	const dispatch = useAppDispatch();
	const { isSidebarCollapsed } = UseReduxState();

	const toggleSidebar = () => {
		dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
	};

	return (
		<div className="flex justify-between items-center w-full mb-7 -mt-2 border-b pb-3 border-[#F9AE19]">
			{/* LEFT SIDE */}
			<div className="flex justify-between items-center gap-5">
				<button
					className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
					onClick={toggleSidebar}
				>
					<Menu className="w-4 h-4" />
				</button>
			</div>

			{/* RIGHT SIDE */}
			<div className="flex justify-between items-center gap-5">
				<div className="hidden md:flex justify-between items-center gap-5">
					<hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-2" />

					<div className="flex items-center cursor-pointer">
						<span className="font-semibold">Hello, Basit</span>
					</div>
				</div>

				<Link href="/settings">
					<Settings className="cursor-pointer text-gray-500" size={24} />
				</Link>
			</div>
		</div>
	);
};
