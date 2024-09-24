import { Supplier } from "./Supplier";

interface ProductsProps {
	params: { supplierId: string };
}

export default function page({ params }: ProductsProps) {
	return <Supplier id={params.supplierId} />;
}
