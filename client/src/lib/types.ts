export interface ProductProps {
	id: string;
	product_name: string;
	brand: string;
	description: string;
	type: string;
	price: string;
	serial_no: string;
	companyId: string;
	createdAt: string;
	updatedAt: string;
	date_sold?: string;
	bought_for?: string;
	sales_status?: string;
	AddedByUser?: { first_name: string; last_name: string; email: string };
	SoldByUser?: { first_name: string; last_name: string; email: string };
	Supplier: {
		supplier_name: string;
		supplier_email?: string;
		supplier_phone_no: string;
	};
	Customer?: {
		buyer_name: string;
		buyer_email?: string;
		buyer_phone_no: string;
	};
	IncomingProducts?: {
		companyId: string;
		id: string;
		swapDate: string;
		updateAt: string;
		outgoingProducts: Array<ProductProps>;
	};
	OutgoingProduct?: {
		companyId: string;
		id: string;
		swapDate: string;
		updateAt: string;
		incomingProducts: Array<ProductProps>;
	};
}

export interface ProductStockProps {
	brand: string;
	product_name: string;
	type: string;
	_count: { type: number };
}

export interface PaginationProps {
	page: number;
	totalPages: number;
}

export interface UrlQueryParams {
	params: string;
	key: string;
	value: string;
}

export interface UserProps {
	companyId: string;
	createdAt: string;
	email: string;
	first_name: string;
	id: string;
	last_name: string;
	password: string;
	role: string;
	updatedAt: string;
	Company: { company_name: string };
}

export interface CustomerProps {
	Products: Array<ProductProps>;
	buyer_email: string;
	buyer_name: string;
	buyer_phone_no: string;
	companyId: string;
	createdAt: string;
	id: string;
	updatedAt: string;
}

export interface SupplierProps {
	Products: Array<ProductProps>;
	companyId: string;
	createdAt: string;
	id: string;
	supplier_email: string;
	supplier_name: string;
	supplier_phone_no: string;
	updatedAt: string;
}
