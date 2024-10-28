import { SingleProductsByName } from "./SingleProductsByName";

interface ProductsProps {
	params: { name: string[] };
}

export default async function Products({ params }: ProductsProps) {
	return (
		<SingleProductsByName
			type={params.name[0]}
			brand={params.name[1]}
		/>
	);
}
