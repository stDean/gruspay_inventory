import { SingleInvoice } from "./SingleInvoice";

interface ProductsProps {
	params: { id: string };
}

export default function SingleInvoicePage({ params }: ProductsProps) {
	return <SingleInvoice />;
}
