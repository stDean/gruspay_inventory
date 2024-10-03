import { ReactNode } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface SelectContainerProps {
	value: string;
	handleChange: (val: string) => void;
	style?: string;
	addCaret?: boolean;
	placeholder?: string;
	children: ReactNode;
}

export const SelectContainer = ({
	value,
	handleChange,
	style,
	addCaret,
	placeholder,
	children,
}: SelectContainerProps) => {
	return (
		<Select value={value} onValueChange={handleChange}>
			<SelectTrigger className={style}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>

			<SelectContent>
				<SelectGroup>{children}</SelectGroup>
			</SelectContent>
		</Select>
	);
};
