"use client";

import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn, months } from "@/lib/utils";

interface DatePickerProps {
	date: Date;
	setDate: (date: Date) => void;
}

export function DatePicker({ date, setDate }: DatePickerProps) {
	const startYear = getYear(new Date()) - 10;
	const endYear = getYear(new Date()) + 5;
	const years = Array.from(
		{ length: endYear - startYear + 1 },
		(_, index) => startYear + index
	);

	const handleMonthChange = (month: string) => {
		const newDate = setMonth(date, months.indexOf(month));
		setDate(newDate);
	};

	const handleYearChange = (year: string) => {
		const newDate = setYear(date, Number(year));
		setDate(newDate);
	};

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full py-5 justify-start text-left font-normal",
						!date && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<div className="flex justify-around pt-1">
					<Select
						onValueChange={handleMonthChange}
						value={months[getMonth(date)]}
					>
						<SelectTrigger className="w-[100px]">
							<SelectValue placeholder="Month" />
						</SelectTrigger>
						<SelectContent>
							{months.map(month => (
								<SelectItem key={month} value={month}>
									{month}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						onValueChange={handleYearChange}
						value={getYear(date).toString()}
					>
						<SelectTrigger className="w-[100px]">
							<SelectValue placeholder="Year" />
						</SelectTrigger>
						<SelectContent>
							{years.map(year => (
								<SelectItem key={year} value={String(year)}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Calendar
					mode="single"
					selected={date}
					onSelect={handleDateSelect}
					initialFocus
					month={date}
					onMonthChange={setDate}
				/>
			</PopoverContent>
		</Popover>
	);
}
