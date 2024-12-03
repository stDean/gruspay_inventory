"use client";

import {
	getBarChartData,
	getBusSummaryStats,
	getTopSellerStats,
	getTopSellingStocks,
	getTotalSalesNPurchaseStats,
} from "@/actions/inventory";
import { useAppDispatch } from "@/app/redux";
import { BarChartContent } from "@/components/BarChartContent";
import { MonthsDropDown } from "@/components/MonthsDropDown";
import { Skeleton } from "@/components/ui/skeleton";
import { YearSelect } from "@/components/YearSelect";
import { useReduxState } from "@/hook/useRedux";
import { BarChartProps } from "@/lib/types";
import { fetchUser, formatCurrency, months } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface TopSellerDetail {
	first_name: string;
	last_name: string;
	count: number;
	totalPrice: number;
}

interface BusinessSum {
	businessSummary: {
		stockCount: number;
		totalUnsoldPrice: number;
		suppliers: number;
		customers: number;
		creditors: number;
	};
	lowQuantityProducts: { product_name: string; count: number }[];
}

interface TopSellingProd {
	topSellingWithDetails: {
		product_name: string;
		remaining_quantity: number;
		total_sold: number;
		total_sold_price: number;
	}[];
}

interface TotalSalesNdPurchase {
	totalPurchasePrice: number;
	totalPurchasesCount: number;
	totalSalesCount: number;
	totalSoldPrice: number;
}

export const DashboardContent = () => {
	const { token } = useReduxState();
	const dispatch = useAppDispatch();

	const [sellerPend, setSellerPend] = useState(false);
	const [sumPend, setSumPend] = useState(false);
	const [tspPend, setTspPend] = useState(false);
	const [statsPend, setStatsPend] = useState(false);
	const [topSeller, setTopSeller] = useState<TopSellerDetail>();
	const [businessSummary, setBusinessSummary] = useState<BusinessSum>();
	const [topSelling, setTopSelling] = useState<TopSellingProd>();
	const [totalSalesNdPurchase, setTotalSalesNdPurchase] =
		useState<TotalSalesNdPurchase>();

	// Bar chart data
	const [barPend, setBarPend] = useState(false);
	const [data, setData] = useState<BarChartProps[]>();

	const setUserState = useCallback(async () => {
		await fetchUser(token, dispatch);
	}, []);

	// filters
	const [selectedYears, setSelectedYears] = useState<{
		dashYear: string;
		stockYear: string;
		topSellerYear: string;
		bar: string;
	}>({ dashYear: "", stockYear: "", topSellerYear: "", bar: "" });

	const handleYearChange = (componentKey: string, value: string) => {
		setSelectedYears(prevState => ({
			...prevState,
			[componentKey]: value, // Update the selected value for the specific component
		}));
	};

	const [selectedMonths, setSelectedMonths] = useState<{
		dashMonth: string;
		stockMonth: string;
		topSellerMonth: string;
	}>({ dashMonth: "", stockMonth: "", topSellerMonth: "" });

	const handleMonthChange = (componentKey: string, value: string) => {
		setSelectedMonths(prevState => ({
			...prevState,
			[componentKey]: value, // Update the selected value for the specific component
		}));
	};

	// Bar data only fetched when needed, no need to trigger on filter change
	const getBarData = useCallback(async () => {
		setBarPend(true);
		const res = await getBarChartData({
			token,
			barYear: selectedYears["bar"],
		});

		if (res?.error) {
			toast.error("Error", { description: res?.error });
			setBarPend(false);
			return;
		}

		setData(res?.data.data);
		setBarPend(false);
	}, [selectedYears.bar]);

	const getTopSeller = useCallback(async () => {
		setSellerPend(true);
		const res = await getTopSellerStats({
			token,
			sellerYear: selectedYears["topSellerYear"],
			sellerMonth:
				selectedMonths["topSellerMonth"] !== ""
					? String(months.indexOf(selectedMonths["topSellerMonth"]) + 1)
					: "",
		});

		if (res?.error) {
			toast.error("Error", { description: res?.error });
			setSellerPend(false);
			return;
		}

		setTopSeller({
			first_name: res?.data.topSellerDetail.first_name,
			last_name: res?.data.topSellerDetail.last_name,
			count: res?.data.topSellerDetail.count,
			totalPrice: res?.data.topSellerDetail.totalPrice,
		});
		setSellerPend(false);
	}, [selectedYears.topSellerYear, selectedMonths.topSellerMonth]);

	const getBusinessSummary = useCallback(async () => {
		setSumPend(true);
		const res = await getBusSummaryStats({ token });

		if (res?.error) {
			toast.error("Error", { description: res?.error });
			setSumPend(false);
			return;
		}

		setBusinessSummary({
			businessSummary: res?.data.businessSummary,
			lowQuantityProducts: res?.data.lowQuantityProducts,
		});
		setSumPend(false);
	}, []);

	const getTotalStats = useCallback(async () => {
		setStatsPend(true);
		const res = await getTotalSalesNPurchaseStats({
			token,
			soldYear: selectedYears["dashYear"],
			soldMonth:
				selectedMonths["dashMonth"] !== ""
					? String(months.indexOf(selectedMonths["dashMonth"]) + 1)
					: "",
		});

		if (res?.error) {
			toast.error("Error", { description: res?.error });
			setStatsPend(false);
			return;
		}

		setTotalSalesNdPurchase({
			totalPurchasePrice: res?.data.totalPurchasePrice,
			totalPurchasesCount: res?.data.totalPurchasesCount,
			totalSalesCount: res?.data.totalSalesCount,
			totalSoldPrice: res?.data.totalSoldPrice,
		});
		setStatsPend(false);
	}, [selectedYears.dashYear, selectedMonths.dashMonth]);

	const getTopSellingStats = useCallback(async () => {
		setTspPend(true);
		const res = await getTopSellingStocks({
			token,
			tssYear: selectedYears["stockYear"],
			tssMonth:
				selectedMonths["stockMonth"] !== ""
					? String(months.indexOf(selectedMonths["stockMonth"]) + 1)
					: "",
		});

		if (res?.error) {
			toast.error("Error", { description: res?.error });
			setTspPend(false);
			return;
		}

		setTopSelling({
			topSellingWithDetails: res?.data.topSellingWithDetails,
		});
		setTspPend(false);
	}, [selectedYears.stockYear, selectedMonths.stockMonth]);

	useEffect(() => {
		setUserState();
	}, []);

	useEffect(() => {
		getTopSeller();
	}, [getTopSeller]);

	useEffect(() => {
		getBusinessSummary();
	}, [getBusinessSummary]);

	useEffect(() => {
		getTotalStats();
	}, [getTotalStats]);

	useEffect(() => {
		getTopSellingStats();
	}, [getTopSellingStats]);

	useEffect(() => {
		getBarData();
	}, [getBarData]);

	const index = new Date().getMonth();
	const currentYear = new Date().getFullYear();

	return (
		<div className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-10 md:mx-4">
			<div className="col-span-7 flex flex-col gap-4">
				{statsPend ? (
					<div className="border rounded-lg shadow-md p-6 bg-white/70 flex justify-between overflow-x-hidden">
						<div className="space-y-2">
							<p className="font-semibold text-base lg:text-lg">Total Sales</p>
							<Skeleton className="h-14 w-28" />
							<Skeleton className="h-6 w-20" />
						</div>

						<div className="space-y-2">
							<p className="font-semibold text-base lg:text-lg">
								Total Purchases
							</p>
							<Skeleton className="h-14 w-28" />
							<Skeleton className="h-6 w-20" />
						</div>

						<div className="space-y-4">
							<MonthsDropDown
								initialMonth={selectedMonths["dashMonth"] || months[index]}
								onMonthChange={handleMonthChange}
								componentKey="dashMonth"
							/>
							<YearSelect
								onYearChange={handleYearChange}
								startYear={2024}
								endYear={2034}
								componentKey="dashYear"
								initialYear={selectedYears["dashYear"] || String(currentYear)}
							/>
						</div>
					</div>
				) : (
					<div className="border rounded-lg shadow-md p-6 bg-white/70 flex justify-between overflow-x-hidden">
						<div className="space-y-2">
							<p className="font-semibold text-base lg:text-lg">Total Sales</p>
							<h1 className="font-semibold text-2xl lg:text-3xl xl:text-5xl">
								{formatCurrency(
									Number(totalSalesNdPurchase?.totalSoldPrice || 0)
								)}
							</h1>
							<p className="font-semibold md:text-lg">
								{totalSalesNdPurchase?.totalSalesCount || 0} item(s)
							</p>
						</div>

						<div className="space-y-2">
							<p className="font-semibold text-base lg:text-lg">
								Total Purchases
							</p>
							<h1 className="font-semibold text-2xl lg:text-3xl xl:text-5xl">
								{formatCurrency(
									Number(totalSalesNdPurchase?.totalPurchasePrice) || 0
								)}
							</h1>
							<p className="font-semibold md:text-lg">
								{totalSalesNdPurchase?.totalPurchasesCount || 0} item(s)
							</p>
						</div>

						<div className="space-y-4">
							<MonthsDropDown
								initialMonth={selectedMonths["dashMonth"] || months[index]}
								onMonthChange={handleMonthChange}
								componentKey="dashMonth"
							/>
							<YearSelect
								onYearChange={handleYearChange}
								startYear={2024}
								endYear={2034}
								componentKey="dashYear"
								initialYear={selectedYears["dashYear"] || String(currentYear)}
							/>
						</div>
					</div>
				)}

				<div className="border rounded-lg shadow-md p-6 pt-4 bg-white/70 ">
					<div className="flex justify-end mb-2">
						<YearSelect
							onYearChange={handleYearChange}
							startYear={2024}
							endYear={2034}
							style="w-fit"
							key="bar"
							componentKey="bar"
							initialYear={selectedYears["bar"] || String(currentYear)}
						/>
					</div>

					{barPend ? (
						<Skeleton className="h-[305px] w-full" />
					) : (
						<BarChartContent data={data || []} />
					)}
				</div>

				<div className="border rounded-lg shadow-md p-6 bg-white/70 space-y-4">
					<div className="flex justify-between items-center">
						<p className="font-semibold text-xl">Top Selling Stock</p>

						<div className="flex gap-4">
							<MonthsDropDown
								initialMonth={selectedMonths["stockMonth"] || months[index]}
								onMonthChange={handleMonthChange}
								componentKey="stockMonth"
							/>
							<YearSelect
								onYearChange={handleYearChange}
								startYear={2024}
								endYear={2034}
								componentKey="stockYear"
								initialYear={selectedYears["stockYear"] || String(currentYear)}
							/>
						</div>
					</div>

					<div className="">
						<div className="flex justify-between border-t py-2 lg:text-lg">
							<p className="font-semibold">Product Name</p>
							<p className="font-semibold">Sold Quantity</p>
							<p className="font-semibold">Remaining Quantity</p>
							<p className="font-semibold">Value</p>
						</div>

						{tspPend ? (
							<>
								{[1, 2, 3, 4, 5].map((_, i) => (
									<div
										key={i}
										className="flex justify-between border-t py-2 text-sm lg:text-base font-semibold"
									>
										<Skeleton className="w-full h-6" />
										<Skeleton className="w-full h-6" />
										<Skeleton className="w-full h-6" />
										<Skeleton className="w-full h-6" />
									</div>
								))}
							</>
						) : (
							<>
								{topSelling?.topSellingWithDetails.map(product => (
									<div
										key={product.product_name}
										className="flex justify-between border-t py-2 text-sm lg:text-base font-semibold"
									>
										<p className="flex-1">{product.product_name}</p>
										<p className="flex-1 flex justify-center">
											{product.total_sold}
										</p>
										<p className="flex-1 flex justify-center">
											{product.remaining_quantity}
										</p>
										<p className="flex-1 flex justify-end">
											{formatCurrency(Number(product.total_sold_price) || 0)}
										</p>
									</div>
								))}
							</>
						)}
					</div>
				</div>
			</div>

			{/* Left side */}
			<div className="col-span-5 flex flex-col gap-4">
				<div className="border rounded-lg shadow-md p-6 bg-white/70 flex justify-between">
					{sellerPend ? (
						<div className="space-y-3">
							<p className="font-semibold text-lg">Top Seller</p>
							<Skeleton className="h-10 w-44" />

							<div className="flex gap-3">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-20" />
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<p className="font-semibold text-lg">Top Seller</p>
							<p className="font-semibold text-3xl">
								{topSeller?.first_name || ""} {topSeller?.last_name}
							</p>
							<p className="space-x-10 font-semibold text-lg md:flex md:flex-col md:space-x-0 lg:block lg:space-x-4 xl:space-x-10">
								<span>
									{formatCurrency(Number(topSeller?.totalPrice) || 0)}
								</span>
								<span>{topSeller?.count || 0} item(s)</span>
							</p>
						</div>
					)}

					<div className="flex flex-col lg:flex-row gap-4">
						<MonthsDropDown
							initialMonth={selectedMonths["topSellerMonth"] || months[index]}
							onMonthChange={handleMonthChange}
							componentKey="topSellerMonth"
						/>
						<YearSelect
							onYearChange={handleYearChange}
							startYear={2024}
							endYear={2034}
							componentKey="topSellerYear"
							initialYear={
								selectedYears["topSellerYear"] || String(currentYear)
							}
						/>
					</div>
				</div>

				{/* Business summary */}
				<div className="border rounded-lg shadow-md p-6 bg-white/70 space-y-4">
					<p className="font-semibold text-xl">Business Summary</p>

					<hr />

					{sumPend ? (
						<div className="space-y-2">
							<div className="flex flex-col">
								<Skeleton className="h-10 w-20" />
								<span className="font-semibold">Stock Count</span>
							</div>

							<div className="flex flex-col">
								<Skeleton className="h-10 w-20" />
								<span className="font-semibold">Inventory Value</span>
							</div>

							<div className="flex flex-col">
								<Skeleton className="h-10 w-20" />
								<span className="font-semibold">Number of Suppliers</span>
							</div>

							<div className="flex flex-col">
								<Skeleton className="h-10 w-20" />
								<span className="font-semibold">Number of Customers</span>
							</div>

							<div className="flex flex-col">
								<Skeleton className="h-10 w-20" />
								<span className="font-semibold">Number of Debtors</span>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							<p className="flex flex-col">
								<span className="font-semibold text-2xl md:text-4xl">
									{businessSummary?.businessSummary?.stockCount || 0}
								</span>
								<span className="font-semibold">Stock Count</span>
							</p>

							<p className="flex flex-col">
								<span className="font-semibold text-2xl md:text-4xl">
									{formatCurrency(
										Number(
											businessSummary?.businessSummary?.totalUnsoldPrice
										) || 0
									)}
								</span>
								<span className="font-semibold">Inventory Value</span>
							</p>

							<p className="flex flex-col">
								<span className="font-semibold text-2xl md:text-4xl">
									{businessSummary?.businessSummary?.suppliers || 0}
								</span>
								<span className="font-semibold">Number of Suppliers</span>
							</p>

							<p className="flex flex-col">
								<span className="font-semibold text-2xl md:text-4xl">
									{businessSummary?.businessSummary?.customers || 0}
								</span>
								<span className="font-semibold">Number of Customers</span>
							</p>

							<p className="flex flex-col">
								<span className="font-semibold text-2xl md:text-4xl">
									{businessSummary?.businessSummary?.creditors || 0}
								</span>
								<span className="font-semibold">Number of Debtors</span>
							</p>
						</div>
					)}
				</div>

				{/* Low Quantity Stock */}
				<div className="border rounded-lg shadow-md p-6 bg-white/70 space-y-4">
					<p className="font-semibold text-xl">Low Quantity Stock</p>

					<div className="">
						<div className="flex justify-between border-t py-2 text-sm lg:text-base">
							<p className="font-semibold">Product Name</p>
							<p className="font-semibold mr-7">Remaining Quantity</p>
						</div>

						{sumPend ? (
							<>
								{[1, 2, 3, 4, 5].map((_, idx) => (
									<div
										key={idx}
										className="flex justify-between border-t py-2 text-sm lg:text-base font-semibold"
									>
										<Skeleton className="h-5 w-24" />
										<Skeleton className="h-5 w-10 mr-36" />
									</div>
								))}
							</>
						) : (
							<>
								{businessSummary?.lowQuantityProducts.map((product, idx) => (
									<div
										key={product.product_name || idx}
										className="flex justify-between border-t py-2 text-sm lg:text-base font-semibold"
									>
										<p>{product.product_name}</p>
										<p className="mr-36">{product.count}</p>
									</div>
								))}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
