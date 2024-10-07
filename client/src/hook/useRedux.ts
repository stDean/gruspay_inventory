import { useAppSelector } from "@/app/redux";

export const useReduxState = () => {
	const {
		email,
		isSidebarCollapsed,
		loggedInUser,
		token,
		previewProducts,
		singleData,
		user,
	} = useAppSelector(({ global }) => global);
	const companyDetails = user?.Company;

	return {
		email,
		isSidebarCollapsed,
		loggedInUser,
		token,
		previewProducts,
		singleData,
		user,
		companyDetails,
	};
};
