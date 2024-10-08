import { FC, ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
	return <main className="min-h-screen bg-gray-50 flex justify-center items-center">{children}</main>;
};

export default AuthLayout;
