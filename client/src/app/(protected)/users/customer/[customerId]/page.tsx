import { Customer } from "../Customer";

interface ProductsProps {
	params: { customerId: string };
}

export default function page({ params }: ProductsProps) {
	return <Customer id={params.customerId} />;
}
