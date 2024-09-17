import { useAppSelector } from "@/app/redux";

export const useReduxState = () => {
	const {
		email,
		isSidebarCollapsed,
		loggedInUser,
		token,
		previewProducts,
		singleData,
	} = useAppSelector(({ global }) => global);

	return {
		email,
		isSidebarCollapsed,
		loggedInUser,
		token,
		previewProducts,
		singleData,
	};
};
