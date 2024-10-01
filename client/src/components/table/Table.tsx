import { Pagination } from "@/components/Pagination";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { ReactElement } from "react";

interface TableContainerProps {
	tableHeaders: ReactElement;
	tableBody: ReactElement;
  totalPages?: number;
  currentPage?: number;
}

export const TableContainer = ({
	tableHeaders,
	tableBody,
	totalPages,
	currentPage,
}: TableContainerProps) => {
	return (
		<div className="rounded-md border w-full shadow-md">
			<Table>
				<TableHeader className="bg-[#f3f4f4]">
					<TableRow>{tableHeaders}</TableRow>
				</TableHeader>

				<TableBody>{tableBody}</TableBody>
			</Table>

			{totalPages! > 1 && (
				<div className=" w-full border-t">
					<Pagination totalPages={totalPages!} page={currentPage!} />
				</div>
			)}
		</div>
	);
};
