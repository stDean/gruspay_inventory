"use client";

import { getBarChartData, getDashboardStats } from "@/actions/inventory";
import { getUser } from "@/actions/user";
import { useAppDispatch } from "@/app/redux";
import { BarChartContent } from "@/components/BarChartContent";
import { MonthsDropDown } from "@/components/MonthsDropDown";
import { Spinner } from "@/components/Spinners";
import { YearSelect } from "@/components/YearSelect";
import { useReduxState } from "@/hook/useRedux";
import { BarChartProps, DashboardProps } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { setUser } from "@/state";
import { useCallback, useEffect, useState, useTransition } from "react";

export const DashboardContent = () => {
	const dispatch = useAppDispatch();
	const { token, user } = useReduxState();
	const [isPending, startTransition] = useTransition();

	const [dashboardStat, setDashboardStat] = useState<DashboardProps>();
	const [data, setData] = useState<BarChartProps[]>();

	const setUserState = useCallback(async () => {
		const { data } = await getUser({ token });
		dispatch(setUser(data.userInDb));
	}, [token, user]);

	const dashboardStats = () => {
		startTransition(async () => {
			const { data } = await getDashboardStats({ token });
			setDashboardStat(data);
		});
	};

	const getBarData = useCallback(() => {
		startTransition(async () => {
			const { data } = await getBarChartData({ token });
			setData(data.data);
		});
	}, [token]);

	useEffect(() => {
		setUserState();
		dashboardStats();
		getBarData();
	}, []);

	// filters
	const [selectedYears, setSelectedYears] = useState<{
		[key: string]: number;
	}>();

	const handleYearChange = (componentKey: string, value: number) => {
		setSelectedYears(prevState => ({
			...prevState,
			[componentKey]: value, // Update the selected value for the specific component
		}));
	};

	const [selectedMonths, setSelectedMonths] = useState<{
		[key: string]: string;
	}>();

	const handleMonthChange = (componentKey: string, value: string) => {
		setSelectedMonths(prevState => ({
			...prevState,
			[componentKey]: value, // Update the selected value for the specific component
		}));
	};

	console.log({ selectedYears, selectedMonths });

	return isPending ? (
		<Spinner />
	) : (
		<div className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-10 md:mx-4">
			<div className="col-span-7 flex flex-col gap-4">
				<div className="border rounded-lg shadow-md p-6 bg-white/70 flex justify-between overflow-x-hidden">
					<div className="space-y-2">
						<p className="font-semibold text-base lg:text-lg">Total Sales</p>
						<h1 className="font-semibold text-2xl lg:text-3xl xl:text-5xl">
							{formatCurrency(Number(dashboardStat?.totalSoldPrice || 0))}
						</h1>
						<p className="font-semibold md:text-lg">
							{dashboardStat?.totalSalesCount || 0} item(s)
						</p>
					</div>

					<div className="space-y-2">
						<p className="font-semibold text-base lg:text-lg">
							Total Purchases
						</p>
						<h1 className="font-semibold text-2xl lg:text-3xl xl:text-5xl">
							{formatCurrency(Number(dashboardStat?.totalPurchasePrice || 0))}
						</h1>
						<p className="font-semibold md:text-lg">
							{dashboardStat?.totalPurchasesCount || 0} item(s)
						</p>
					</div>

					<div className="space-y-4">
						<MonthsDropDown
							onMonthChange={handleMonthChange}
							componentKey="dashMonth"
						/>
						<YearSelect
							onYearChange={handleYearChange}
							startYear={2024}
							endYear={2034}
							componentKey="dashYear"
						/>
					</div>
				</div>

				<div className="border rounded-lg shadow-md p-6 pt-4 bg-white/70 ">
					<div className="flex justify-end mb-2">
						<YearSelect
							onYearChange={handleYearChange}
							startYear={2024}
							endYear={2034}
							style="w-fit"
							key="bar"
							componentKey="bar"
						/>
					</div>

					<BarChartContent data={data!} />
				</div>

				<div className="border rounded-lg shadow-md p-6 bg-white/70 space-y-4">
					<div className="flex justify-between items-center">
						<p className="font-semibold text-xl">Top Selling Stock</p>

						<div className="flex gap-4">
							<MonthsDropDown
								onMonthChange={handleMonthChange}
								componentKey="stockMonth"
							/>
							<YearSelect
								onYearChange={handleYearChange}
								startYear={2024}
								endYear={2034}
								componentKey="stockYear"
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
						{dashboardStat?.topSellingWithDetails.map(product => (
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
					</div>
				</div>
			</div>

			{/* Left side */}
			<div className="col-span-5 flex flex-col gap-4">
				<div className="border rounded-lg shadow-md p-6 bg-white/70 flex justify-between">
					<div className="space-y-3">
						<p className="font-semibold text-lg">Top Seller</p>
						<p className="font-semibold text-3xl">
							{dashboardStat?.topSellerDetail.first_name}{" "}
							{dashboardStat?.topSellerDetail.last_name}
						</p>
						<p className="space-x-10 font-semibold text-lg">
							<span>
								{formatCurrency(
									Number(dashboardStat?.topSellerDetail.totalPrice) || 0
								)}
							</span>
							<span>{dashboardStat?.topSellerDetail.count} item(s)</span>
						</p>
					</div>

					<div className="flex flex-col lg:flex-row gap-4">
						<MonthsDropDown
							onMonthChange={handleMonthChange}
							componentKey="topSellerMonth"
						/>
						<YearSelect
							onYearChange={handleYearChange}
							startYear={2024}
							endYear={2034}
							componentKey="topSellerYear"
						/>
					</div>
				</div>

				{/* Business summary */}
				<div className="border rounded-lg shadow-md p-6 bg-white/70 space-y-4">
					<p className="font-semibold text-xl">Business Summary</p>

					<hr />

					<div className="space-y-2">
						<p className="flex flex-col">
							<span className="font-semibold text-2xl md:text-4xl">
								{dashboardStat?.businessSummary.stockCount}
							</span>
							<span className="font-semibold">Stock Count</span>
						</p>

						<p className="flex flex-col">
							<span className="font-semibold text-2xl md:text-4xl">
								{formatCurrency(
									Number(dashboardStat?.businessSummary.totalUnsoldPrice) || 0
								)}
							</span>
							<span className="font-semibold">Inventory Value</span>
						</p>

						<p className="flex flex-col">
							<span className="font-semibold text-2xl md:text-4xl">
								{dashboardStat?.businessSummary.suppliers}
							</span>
							<span className="font-semibold">Number of Suppliers</span>
						</p>

						<p className="flex flex-col">
							<span className="font-semibold text-2xl md:text-4xl">
								{dashboardStat?.businessSummary.customers}
							</span>
							<span className="font-semibold">Number of Customers</span>
						</p>
					</div>
				</div>

				{/* Low Quantity Stock */}
				<div className="border rounded-lg shadow-md p-6 bg-white/70 space-y-4">
					<p className="font-semibold text-xl">Low Quantity Stock</p>

					<div className="">
						<div className="flex justify-between border-t py-2 text-sm lg:text-base">
							<p className="font-semibold">Product Name</p>
							<p className="font-semibold mr-7">Remaining Quantity</p>
						</div>
						{dashboardStat?.lowQuantityProducts.map(product => (
							<div
								key={product.product_name}
								className="flex justify-between border-t py-2 text-sm lg:text-base font-semibold"
							>
								<p>{product.product_name}</p>
								<p className="mr-36">{product.count}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
