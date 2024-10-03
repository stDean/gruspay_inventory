"use client";

import { useState } from "react";
import { SelectContainer } from "./SelectContainer";
import { SelectItem } from "./ui/select";

const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const MonthsDropDown = ({
	style,
	componentKey,
	onMonthChange,
}: {
	style?: string;
	componentKey: string;
	onMonthChange: (key: string, value: string) => void;
}) => {
	const index = new Date().getMonth();
	const [selectedMonth, setSelectedMonth] = useState<string>(months[index]);

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
			{months.map(month => (
				<SelectItem value={month.toString()} key={month}>
					{month}
				</SelectItem>
			))}
		</SelectContainer>
	);
};
