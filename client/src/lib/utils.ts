import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { UrlQueryParams } from "./types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
	const currentUrl = qs.parse(params);

	currentUrl[key] = value;

	return qs.stringifyUrl(
		{
			url: window.location.pathname,
			query: currentUrl,
		},
		{ skipNull: true }
	);
}

export const formatCurrency = (val: number, symbol: string = "₦") => {
	const formattedNumber = new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
	});

	return formattedNumber.format(val);
};

export const AddProductsType = {
	name: "add_products",
	options: [
		{
			title: "Add an Item",
			subTitle: "Add one product at a time",
		},

		{
			title: "Bulk items upload",
			subTitle: "Add multiple products at once",
		},
	],
} as const;

export const BillingPlanType = {
	name: "billingPlan",
	options: [
		{
			title: "Personal",
			amount: formatCurrency(18500),
			yrAmount: formatCurrency(14800),
			amountPY: formatCurrency(222000),
			yrAmountPY: formatCurrency(177600),
			subTitle: "Includes access to 1 user, 70 inventory items.",
		},

		{
			title: "Team",
			amount: formatCurrency(24000),
			yrAmount: formatCurrency(19200),
			amountPY: formatCurrency(288000),
			yrAmountPY: formatCurrency(230400),
			subTitle:
				"Includes access to 3 user, 150 inventory items and suppliers information.",
		},
		{
			title: "Enterprise",
			amount: formatCurrency(36500),
			yrAmount: formatCurrency(29000),
			amountPY: formatCurrency(435000),
			yrAmountPY: formatCurrency(348000),
			subTitle:
				"Includes access to 5 user, 250 inventory items, suppliers, customers and creditor information.",
		},
	],
} as const;

export const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
