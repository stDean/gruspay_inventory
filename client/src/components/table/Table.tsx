import { Pagination } from "@/components/Pagination";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { ChangeEvent, ReactElement, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface TableContainerProps {
	tableHeaders: ReactElement;
	tableBody: ReactElement;
	totalPages?: number;
	currentPage?: number;
	dropFilter?: boolean;
	search?: boolean;
	placeHolder?: string;
	value?: string;
	handleChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	itemsType?: ReactNode;
	itemsBrand?: ReactNode;
	handleTypeChange?: (value: string) => void;
	handleBrandChange?: (value: string) => void;
	handleClear?: () => void;
}

const FilterSelect = ({
	selectPlaceHolder,
	label,
	items,
	onChange,
}: {
	selectPlaceHolder: string;
	label: string;
	items: ReactNode;
	onChange: (value: string) => void;
}) => {
	return (
		<Select onValueChange={onChange}>
			<SelectTrigger className="w-[100px] md:w-[150px] lg:w-[180px]">
				<SelectValue placeholder={selectPlaceHolder} />
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

export const TableContainer = ({
	tableHeaders,
	tableBody,
	totalPages,
	currentPage,
	dropFilter,
	search,
	value,
	placeHolder,
	handleChange,
	itemsType,
	itemsBrand,
	handleTypeChange,
	handleBrandChange,
	handleClear,
}: TableContainerProps) => {
	return (
		<div className="rounded-md border w-full shadow-md">
			{search && (
				<div className="p-4 border-b flex flex-col gap-2 items-center md:flex-row">
					<div className="flex-1 flex">
						<Input
							className="w-[350px] md:max-w-sm bg-white pr-8"
							value={value}
							placeholder={placeHolder}
							onChange={handleChange}
						/>

						{value?.trim() !== "" && (
							<div className="-ml-6 mt-[9px]">
								<X
									className="w-4 h-4 text-red-500 hover:text-red-400 cursor-pointer"
									onClick={handleClear}
								/>
							</div>
						)}
					</div>

					{dropFilter && (
						<div className="flex-1 flex justify-center gap-4 md:justify-end">
							<FilterSelect
								label="Filter Type"
								selectPlaceHolder="Type"
								items={itemsType}
								onChange={handleTypeChange as any}
							/>
							<FilterSelect
								label="Filter Brand"
								selectPlaceHolder="Brand"
								items={itemsBrand}
								onChange={handleBrandChange as any}
							/>
						</div>
					)}
				</div>
			)}

			<Table>
				<TableHeader className="bg-[#f3f4f4]">
					<TableRow>{tableHeaders}</TableRow>
				</TableHeader>

				<TableBody>{tableBody}</TableBody>
			</Table>

			{totalPages && totalPages > 1 && (
				<div className=" w-full border-t">
					<Pagination
						totalPages={totalPages as number}
						page={currentPage as number}
					/>
				</div>
			)}
		</div>
	);
};
