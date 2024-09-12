export interface ProductProps {
	added_by: string;
	brand: string;
	companyId: string;
	createdAt: string;
	description: string;
	id: string;
	other_meta_data?: string;
	price: string;
	product_name: string;
	serialNo: string;
	supplierEmail?: string;
	supplierPhoneNo: string;
	supplier_name: string;
	type: string;
	updatedAt: string;
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
