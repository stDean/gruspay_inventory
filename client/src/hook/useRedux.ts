import { useAppSelector } from "@/app/redux";

export const useReduxState = () => {
	const { email, isSidebarCollapsed, loggedInUser, token, previewProducts } =
		useAppSelector(({ global }) => global);

	return { email, isSidebarCollapsed, loggedInUser, token, previewProducts };
};
