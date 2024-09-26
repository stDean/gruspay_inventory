import { SwapProduct } from "./SwapProduct";

interface ProductsProps {
	params: { name: string };
}

export default function page({ params }: ProductsProps) {
	return <SwapProduct name={params.name} />;
}
