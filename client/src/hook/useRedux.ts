import { useAppSelector } from "@/app/redux";

export const UseReduxState = () => {
	const { email, isDarkMode, isSidebarCollapsed, loggedInUser, token } =
		useAppSelector(({ global }) => global);

	return { email, isDarkMode, isSidebarCollapsed, loggedInUser, token };
};
