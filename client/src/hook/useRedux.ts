import { useAppSelector } from "@/app/redux";

export const UseReduxState = () => {
	const { email, isSidebarCollapsed, loggedInUser, token } = useAppSelector(
		({ global }) => global
	);

	return { email, isSidebarCollapsed, loggedInUser, token };
};
