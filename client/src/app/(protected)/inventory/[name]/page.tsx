import { SingleProductsByName } from "./SingleProductsByName";

interface ProductsProps {
	params: { name: string };
}

export default async function Products({ params }: ProductsProps) {
	return <SingleProductsByName name={params.name} />;
}
