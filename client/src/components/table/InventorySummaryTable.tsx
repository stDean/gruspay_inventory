"use client";

import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ProductStockProps } from "@/lib/types";
import Link from "next/link";
import { TableContainer } from "./Table";
import { useState } from "react";
import { SelectItem } from "@/components/ui/select";

interface InventoryProps {
	products: ProductStockProps[];
	page?: number;
	linkTo: string;
	count: string;
}

export const InventorySummaryTable = ({
	products,
	page,
	count,
	linkTo,
}: InventoryProps) => {
	const rowsPerPage = 10;
	const totalPages = Math.ceil(products.length / rowsPerPage);
	const currentPage = page || 1;

	const indexOfLastTransaction = currentPage * rowsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

	const [filter, setFilter] = useState<{
		search: string;
		type: string;
		brand: string;
	}>({ search: "", type: "all", brand: "all" });

	const filterBrandOption = Array.from(
		new Set(products.map(item => item.brand))
	);
	const filterTypeOption = Array.from(new Set(products.map(item => item.type)));

	const itemsType = (
		<>
			<SelectItem value="all">All Types</SelectItem>
			{filterTypeOption.map((item, idx) => (
				<SelectItem value={item} key={item + idx}>
					{item}
				</SelectItem>
			))}
		</>
	);

	const itemsBrand = (
		<>
			<SelectItem value="all">All Brands</SelectItem>
			{filterBrandOption.map((item, idx) => (
				<SelectItem value={item} key={item + idx} className="capitalize">
					{item}
				</SelectItem>
			))}
		</>
	);

	const handleTypeChange = (value: string) => {
		setFilter(prev => ({ ...prev, type: value }));
	};

	const handleBrandChange = (value: string) => {
		setFilter(prev => ({ ...prev, brand: value }));
	};

	const productsByPage = products.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const filteredProducts = productsByPage.filter(item => {
		const matchesType = filter.type === "all" || item.type === filter.type;
		const matchesBrand = filter.brand === "all" || item.brand === filter.brand;

		return matchesType && matchesBrand;
	});

	const tableHeaders = (
		<>
			<TableHead className="px-2 border-r w-5 md:w-10">S/N</TableHead>
			<TableHead className="px-2 border-r w-36">Type</TableHead>
			<TableHead className="px-2 border-r w-36">Brand</TableHead>
			<TableHead className="px-2 w-28">{count} Count</TableHead>
		</>
	);

	const tableBody = (
		<>
			{filteredProducts.map((item, idx) => (
				<TableRow key={item.brand + idx} className="hover:!bg-none">
					<TableCell className="border-r">{idx + 1}</TableCell>
					<TableCell className="border-r capitalize">{item.type}</TableCell>
					<TableCell className="border-r capitalize hover:underline hover:underline-offset-3 text-blue-500 hover:text-blue-400">
						<Link
							href={`/${linkTo}/${item.type}/${item.brand}`}
						>
							{item.brand}
						</Link>
					</TableCell>
					<TableCell className="border-r">{item._count["type"]}</TableCell>
				</TableRow>
			))}
		</>
	);

	return (
		<TableContainer
			totalPages={totalPages}
			currentPage={currentPage}
			tableHeaders={tableHeaders}
			tableBody={tableBody}
			dropFilter
			search
			placeHolder="Search product..."
			value={filter.search}
			handleChange={e =>
				setFilter(prev => ({ ...prev, search: e.target.value }))
			}
			itemsType={itemsType}
			itemsBrand={itemsBrand}
			handleTypeChange={handleTypeChange}
			handleBrandChange={handleBrandChange}
			handleClear={() => {
				setFilter({ ...filter, search: "" });
			}}
		/>
	);
};
