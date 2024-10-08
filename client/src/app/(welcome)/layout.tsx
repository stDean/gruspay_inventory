import { FC, ReactNode } from "react";

interface WelcomeLayoutProps {
	children: ReactNode;
}

const WelcomeLayout: FC<WelcomeLayoutProps> = ({ children }) => {
	return <main className="min-h-screen light bg-gray-50">{children}</main>;
};

export default WelcomeLayout;
