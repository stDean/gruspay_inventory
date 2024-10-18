import { useEffect, useState } from "react";
import { SelectContainer } from "./SelectContainer";
import { SelectItem } from "./ui/select";
import { months } from "@/lib/utils";

export const MonthsDropDown = ({
	style,
	componentKey,
	onMonthChange,
	initialMonth, // Pass the selected month from parent
}: {
	style?: string;
	componentKey: string;
	onMonthChange: (key: string, value: string) => void;
	initialMonth: string; // new prop to control the initial month
}) => {
	// Initialize state with the passed prop (initialMonth)
	const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

	// Update local state when the parent-provided month changes
	useEffect(() => {
		if (initialMonth !== selectedMonth) {
			setSelectedMonth(initialMonth);
		}
	}, [initialMonth, selectedMonth]);

	const handleMonthChange = (val: string) => {
		setSelectedMonth(val);
		onMonthChange(componentKey, val); // Pass selected month and key to parent
	};

	return (
		<SelectContainer
			value={selectedMonth}
			handleChange={handleMonthChange}
			style={style}
		>
			{months.map((month) => (
				<SelectItem value={month.toString()} key={month}>
					{month}
				</SelectItem>
			))}
		</SelectContainer>
	);
};
