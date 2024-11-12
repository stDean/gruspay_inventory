import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { UrlQueryParams } from "./types";
import { Metadata } from "next";
import millify from "millify";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function constructMetadata({
	title = "Cauntr - Inventory",
	description = "A seamless inventory management system",
	icons = "/favicon.ico",
}: {
	title?: string;
	description?: string;
	icons?: string;
} = {}): Metadata {
	return {
		title,
		description,
		icons,
		metadataBase: new URL("https://google.com"),
	};
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

// export const formatCurrency = (val: number) => {
// 	const formattedNumber = new Intl.NumberFormat("en-NG", {
// 		style: "currency",
// 		currency: "NGN",
// 	});

// 	return formattedNumber.format(val);
// };

export const formatCurrency = (val: number) => {
	// Abbreviate the number with millify
	const abbreviatedNumber = millify(val, { precision: 1 });

	// Manually append the currency symbol
	return `₦${abbreviatedNumber}`;
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
			amount: "₦5,600",
			yrAmount: "₦4,480",
			amountPY: "₦67,200",
			yrAmountPY: "₦53,760",
			subTitle: "Includes access to 2 user, unlimited inventory.",
		},

		{
			title: "Team",
			amount: "₦9,100",
			yrAmount: "₦7,280",
			amountPY: "₦109,200",
			yrAmountPY: "₦87,360",
			subTitle:
				"Includes access to 5 user, unlimited inventory, and suppliers information.",
		},
		{
			title: "Enterprise",
			amount: "₦11,300",
			yrAmount: "₦9,040",
			amountPY: "₦135,600",
			yrAmountPY: "₦108,480",
			subTitle:
				"Includes access to 10 user, unlimited inventory, suppliers, customers and creditor information.",
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
