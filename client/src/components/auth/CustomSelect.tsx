import {
	Select,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const CustomSelect = ({
	items,
	value,
	label,
	handleChange,
	width,
	width2,
	disabled,
}: {
	items: ReactNode;
	value: string;
	label: string;
	width?: boolean;
	width2?: boolean;
	handleChange: (value: string, id?: number) => void;
	disabled?: boolean;
}) => {
	return (
		<Select
			value={value}
			onValueChange={(value: string, id?: number) => handleChange(value, id)}
			disabled={disabled}
		>
			<SelectTrigger
				className={cn("h-10", {
					"w-[220px] md:w-full": width,
					"w-[295px] md:w-[170px] text-xs": width2,
				})}
			>
				<SelectValue placeholder="Select a fruit" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>{label}</SelectLabel>
					{items}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
