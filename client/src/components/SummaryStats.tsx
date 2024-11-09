import { UserProps } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SummaryStatsProps {
	title: string;
	category: number;
	stockCount: number;
	stockType: string;
	totalPrice: number;
	totalText: string;
	topSeller: string;
	addClass?: string;
	user: UserProps;
}

export const SummaryStats = ({
	category,
	stockCount,
	stockType,
	totalPrice,
	title,
	totalText,
	topSeller,
	addClass,
	user,
}: SummaryStatsProps) => {
	return (
		<div
			className={`flex flex-col gap-4 border rounded-lg p-3 px-6 mb-3 shadow-lg ${addClass}`}
		>
			<h1 className="font-semibold text-lg">{title}</h1>

			<div className="flex justify-between items-center">
				<div className="space-y-1">
					<p className="text-xl md:text-4xl font-semibold">{category}</p>
					<p className="text-xs md:text-sm font-semibold">Categories</p>
				</div>

				<div className="space-y-1">
					<p className="text-xl md:text-4xl font-semibold">{stockCount}</p>
					<p className="text-xs md:text-sm font-semibold">
						Total Stock {stockType}
					</p>
				</div>

				{user?.role === "ADMIN" && (
					<div className="space-y-1">
						<p className="text-xl md:text-4xl font-semibold">
							{formatCurrency(Number(totalPrice) || 0)}
						</p>
						<p className="text-xs md:text-sm font-semibold">{totalText}</p>
					</div>
				)}

				<div className="space-y-1">
					<p className="text-xl md:text-4xl font-semibold">{topSeller}</p>
					<p className="text-xs md:text-sm font-semibold">
						Top Selling Product
					</p>
				</div>
			</div>
		</div>
	);
};
