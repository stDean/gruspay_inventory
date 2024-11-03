"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const ItemsHeader = ({
	brands,
	routeTo,
	types,
	addBrand,
}: {
	brands?: string;
	routeTo: string;
	types?: string;
	addBrand?: boolean;
}) => {
	const router = useRouter();
	return (
		<>
			<p
				className="flex items-center gap-1 border rounded-2xl w-fit p-1 px-3 justify-center border-blue-500 text-blue-500 hover:border-blue-400 cursor-pointer hover:text-blue-400 mb-3"
				onClick={() => {
					router.push(routeTo);
				}}
			>
				<ArrowLeft className="h-4 w-4" /> Back
			</p>

			{types && (
				<div className="capitalize font-semibold text-2xl flex items-center gap-2 mb-3">
					{addBrand && (
						<div className="flex gap-2 items-center">
							<p className="text-xl">{brands}</p>
							<ChevronRight className="h-5 w-5" />
						</div>
					)}
					<p className="text-xl">{types}</p>
				</div>
			)}
		</>
	);
};
