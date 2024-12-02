import { ShowPolicyModal } from "@/components/modals/ShowPolicyModal";
import { FC, ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
	return (
		<>
			<ShowPolicyModal />
			<main className="min-h-screen bg-gray-50 flex justify-center items-center">
				{children}
			</main>
		</>
	);
};

export default AuthLayout;
