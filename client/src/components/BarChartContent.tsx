"use client";

import { BarChartProps } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const BarChartContent = ({ data }: { data: BarChartProps[] }) => {
	return (
		<ResponsiveContainer width="100%" height={305}>
			<BarChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="month" />
				<YAxis />
				<Tooltip />
				<Legend />
				<Bar dataKey="monthly sales" fill="#8884d8" />
				<Bar dataKey="monthly purchases" fill="#82ca9d" />
			</BarChart>
		</ResponsiveContainer>
	);
};
