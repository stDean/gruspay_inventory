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

export const formatCurrency = (val: number, symbol: string = "₦") => {
  const formattedNumber = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  })

  return formattedNumber.format(val)
}

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