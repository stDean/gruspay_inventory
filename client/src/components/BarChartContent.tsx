"use client";

import { getBarChartData } from "@/actions/inventory";
import { useReduxState } from "@/hook/useRedux";
import { BarChartProps } from "@/lib/types";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts";

export const BarChartContent = () => {
	const { token } = useReduxState();
	const [isPending, startTransition] = useTransition();
	const [data, setData] = useState<BarChartProps[]>();

	const getBarData = useCallback(() => {
		startTransition(async () => {
			const { data } = await getBarChartData({ token });
			setData(data.data);
		});
	}, [token]);

	useEffect(() => {
		getBarData();
	}, []);

	console.log(data);

	return (
		<BarChart width={730} height={330} data={data}>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="month" />
			<YAxis />
			<Tooltip />
			<Legend />
			<Bar dataKey="monthly sale" fill="#8884d8" />
			<Bar dataKey="monthly purchase" fill="#82ca9d" />
		</BarChart>
	);
};
