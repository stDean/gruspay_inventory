"use client";

import { useState } from "react";
import { SelectContainer } from "@/components/SelectContainer";
import { SelectItem } from "@/components/ui/select";

export const YearSelect = ({
	startYear,
	endYear,
	style,
	style2,
	componentKey,
	onYearChange,
	initialYear,
}: {
	startYear: number;
	endYear: number;
	style?: string;
	style2?: string;
	componentKey: string;
	initialYear: string;
	onYearChange: (key: string, value: string) => void;
}) => {
	const years = Array.from(
		{ length: endYear - startYear + 1 },
		(_, index) => startYear + index
	);

	const [selectedYear, setSelectedYear] = useState(initialYear);

	const handleYearChange = (val: string) => {
		const newYear = val;
		setSelectedYear(newYear);
		onYearChange(componentKey, newYear); // Pass selected value and key to parent
	};

	return (
		<SelectContainer
			value={selectedYear.toString()}
			handleChange={handleYearChange}
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
