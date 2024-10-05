import { Creditor } from "../Creditor";

interface ProductsProps {
	params: { creditorId: string };
}

export default function page({ params }: ProductsProps) {
	return <Creditor id={params.creditorId} />;
}
