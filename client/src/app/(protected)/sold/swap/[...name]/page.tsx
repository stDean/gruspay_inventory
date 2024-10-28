import { SwapProduct } from "./SwapProduct";

interface ProductsProps {
	params: { name: string[] };
}

export default function page({ params }: ProductsProps) {
	return <SwapProduct type={params.name[0]} brand={params.name[1]} />;
}
