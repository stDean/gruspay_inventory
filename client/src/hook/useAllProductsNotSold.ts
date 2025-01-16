import { getAllProductsNotSold } from "@/actions/inventory";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export const useProductsNotSold = ({ token }: { token: string }) => {
	const [allProducts, setAllProducts] = useState([]);

	const getProducts = useCallback(async () => {
		const res = await getAllProductsNotSold({ token });
		if (res?.error) {
			toast.error("Error", { description: res?.error });
		}

		setAllProducts(res?.data);
	}, [token]);

	useEffect(() => {
		getProducts();
	}, []);

	return { allProducts };
};
