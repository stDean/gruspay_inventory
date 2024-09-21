import { getAllProductsNotSold } from "@/actions/inventory";
import { useState, useEffect, useCallback } from "react";

export const useProductsNotSold = ({ token }: { token: string }) => {
	const [allProducts, setAllProducts] = useState([]);

	const getProducts = useCallback(async () => {
		const { data } = await getAllProductsNotSold({ token });
		setAllProducts(data);
	}, [token]);

	useEffect(() => {
		getProducts();
	}, []);

	return { allProducts };
};
