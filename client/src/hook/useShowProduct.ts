import { create } from "zustand";

interface ProductProps {
	name: string;
	serial_no: string;
  brand: string
}

interface showProductModalStore {
	isOpen: boolean;
	products: ProductProps[] | null;
	onOpen: (product: ProductProps | null) => void;
	onClose: () => void;
	removeProduct: (serial_no: string) => void;
	addProduct: (product: ProductProps) => void;
}

const useShowProductModal = create<showProductModalStore>((set, get) => ({
	isOpen: false,
	products: [],
	onOpen: (product: ProductProps | null) =>
		set({
			products: product
				? [...(get().products as ProductProps[]), product]
				: get().products,
			isOpen: true,
		}),
	onClose: () => set({ isOpen: false, products: [] }),
	removeProduct: (serial_no: string) =>
		set({
			products: (get()?.products ?? []).filter(
				(product: ProductProps) => product.serial_no !== serial_no
			),
			isOpen: true,
		}),
	addProduct: (product: ProductProps) =>
		set(state => {
			// Check if a product with the same serialNo already exists
			const productExists = state?.products?.some(
				p => p.serial_no === product.serial_no
			);

			// If the product is unique, add it; otherwise, return the existing state
			return productExists
				? state
				: {
						isOpen: true,
						products: [...(state.products ?? []), product],
				  };
		}),
}));

export default useShowProductModal;
