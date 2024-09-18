import { SoldProduct } from "./SoldProduct";

interface ProductsProps {
	params: { name: string };
}

export default function page({ params }: ProductsProps) {
	return <SoldProduct name={params.name} />;
}
