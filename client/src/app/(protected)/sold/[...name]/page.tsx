import { SoldProduct } from "./SoldProduct";

interface ProductsProps {
	params: { name: string[] };
}

export default function page({ params }: ProductsProps) {
	return <SoldProduct type={params.name[0]} brand={params.name[1]} />;
}
