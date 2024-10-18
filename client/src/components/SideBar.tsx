"use client";

import { Logout } from "@/actions/logout";
import { useAppDispatch } from "@/app/redux";
import { useReduxState } from "@/hook/useRedux";
import {
	setEmail,
	setIsSidebarCollapsed,
	setLoggedInUser,
	setToken,
	setUser,
} from "@/state";
import {
	Archive,
	ClipboardCheck,
	Layout,
	LogOut,
	LucideIcon,
	Menu,
	SlidersHorizontal,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarLinkProps {
	href: string;
	icon: LucideIcon;
	label: string;
	isCollapsed: boolean;
}

const SidebarLink = ({
	href,
	icon: Icon,
	label,
	isCollapsed,
}: SidebarLinkProps) => {
	const pathname = usePathname();
	const isActive =
		pathname === href ||
		(pathname === "/" && href === "/dashboard") ||
		pathname.includes(href);

	return (
		<Link href={href}>
			<div
				className={`cursor-pointer flex items-center ${
					isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
				}
        hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
					isActive ? "bg-blue-200 text-white" : ""
				}
      }`}
			>
				<Icon className="w-6 h-6 !text-gray-700" />
				<span
					className={`${
						isCollapsed ? "hidden" : "block"
					} font-medium text-gray-700`}
				>
					{label}
				</span>
			</div>
		</Link>
	);
};

export const SideBar = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isSidebarCollapsed, user } = useReduxState();

	const toggleSidebar = () => {
		dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
	};

	const handleLogout = () => {
		router.push("/welcome");
		Logout();
		dispatch(setLoggedInUser(false));
		dispatch(setToken(""));
		dispatch(setEmail(""));
		dispatch(setUser({}));
	};

	const sidebarClassNames = `fixed flex flex-col ${
		isSidebarCollapsed ? "w-0 md:w-20" : "w-72 md:w-64"
	} bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

	const year = new Date().getFullYear();

	return (
		<div className={sidebarClassNames}>
			{/* TOP LOGO */}
			<div
				className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
					isSidebarCollapsed ? "px-4" : "px-8"
				}`}
			>
				<Image
					src={isSidebarCollapsed ? "/gup.PNG" : "/logo.png"}
					alt="logo"
					width={isSidebarCollapsed ? 250 : 150}
					height={isSidebarCollapsed ? 250 : 150}
					priority
				/>

				<button
					className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
					onClick={toggleSidebar}
				>
					<Menu className="w-4 h-4" />
				</button>
			</div>

			{/* LINKS */}
			<div className="flex-grow mt-8">
				{user?.role === "ADMIN" && (
					<SidebarLink
						href="/dashboard"
						icon={Layout}
						label="Dashboard"
						isCollapsed={isSidebarCollapsed}
					/>
				)}

				<SidebarLink
					href="/inventory"
					icon={Archive}
					label="Inventory"
					isCollapsed={isSidebarCollapsed}
				/>

				{user?.role === "ADMIN" && (
					<SidebarLink
						href="/sold"
						icon={ClipboardCheck}
						label="Sales History"
						isCollapsed={isSidebarCollapsed}
					/>
				)}

				<SidebarLink
					href="/users"
					icon={Users}
					label="Users"
					isCollapsed={isSidebarCollapsed}
				/>

				<SidebarLink
					href="/settings"
					icon={SlidersHorizontal}
					label="Settings"
					isCollapsed={isSidebarCollapsed}
				/>
				{/* <SidebarLink
					href="/expenses"
					icon={CircleDollarSign}
					label="Expenses"
					isCollapsed={isSidebarCollapsed}
				/> */}
			</div>

			{/* FOOTER */}
			<div className="mb-10">
				<div className="flex justify-between gap-2 items-center px-6 mb-4">
					<div className={`${isSidebarCollapsed ? "hidden" : "block"}`}>
						<p className="font-semibold text-base truncate w-44">
							{user?.Company?.company_name}
						</p>
						<p className="text-sm">{user?.email}</p>
					</div>
					<LogOut
						className="text-red-500 cursor-pointer"
						onClick={handleLogout}
					/>
				</div>
				<p
					className={`text-center text-xs text-gray-500 ${
						isSidebarCollapsed ? "hidden" : "block"
					}`}
				>
					&copy; {year} Gruspay
				</p>
			</div>
		</div>
	);
};
