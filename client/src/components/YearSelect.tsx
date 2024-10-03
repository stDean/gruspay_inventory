"use client";

import { useEffect, useState } from "react";
import { SelectContainer } from "./SelectContainer";
import { SelectItem } from "./ui/select";

export const YearSelect = ({
	startYear,
	endYear,
	style,
	addCaret,
	style2,
	componentKey,
	onYearChange,
}: {
	startYear: number;
	endYear: number;
	style?: string;
	addCaret?: boolean;
	style2?: string;
	componentKey: string;
	onYearChange: (key: string, value: number) => void;
}) => {
	const currentYear = new Date().getFullYear();
	const years = Array.from(
		{ length: endYear - startYear + 1 },
		(_, index) => startYear + index
	);

	const [selectedYear, setSelectedYear] = useState(currentYear);

	const handleYearChange = (val: string) => {
		const newYear = Number(val);
		setSelectedYear(newYear);
		onYearChange(componentKey, newYear); // Pass selected value and key to parent
	};

	return (
		<SelectContainer
			value={selectedYear.toString()}
			handleChange={handleYearChange}
			addCaret={addCaret}
			style={style}
			placeholder="year"
		>
			{years.map(year => (
				<SelectItem className={style2} value={year.toString()} key={year}>
					{year}
				</SelectItem>
			))}
		</SelectContainer>
	);
};
