import { prisma } from "../utils/db.mjs";
import { StatusCodes } from "http-status-codes";

const useUserAndCompany = async ({ company_id, email }) => {
	const company = await prisma.company.findUnique({
		where: { id: company_id },
	});
	const user = await prisma.users.findUnique({
		where: { email },
	});

	return { company, user };
};

export const InventoryCtrl = {
	createProduct: async (req, res) => {
		const {
			user: { company_id, email },
			body: {
				product_name,
				brand,
				description,
				type,
				price,
				serial_no,
				supplier_name,
				supplier_phone_no,
				supplier_email,
			},
		} = req;

		const product = await prisma.products.findUnique({
			where: { serial_no },
		});
		if (product)
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Product already exists" });

		const { company, user } = await useUserAndCompany({ company_id, email });
		await prisma.products.create({
			data: {
				product_name,
				brand,
				description,
				type,
				price,
				serial_no,
				Company: {
					connect: { id: company.id },
				},
				AddedByUser: {
					connect: { id: user.id },
				},
				Supplier: {
					connectOrCreate: {
						where: { supplier_name },
						create: {
							supplier_name,
							supplier_email: supplier_email || null,
							supplier_phone_no,
							companyId: company.id,
						},
					},
				},
			},
		});

		res.status(StatusCodes.OK).json({ msg: "createProduct" });
	},
	createProducts: async (req, res) => {
		const {
			user: { company_id, email },
		} = req;
		const { company, user } = await useUserAndCompany({ company_id, email });

		const errors = [];
		const results = [];

		await Promise.all(
			req.body.map(async product => {
				try {
					const result = await prisma.products.create({
						data: {
							product_name: product.product_name,
							brand: product.brand,
							description: product.description,
							type: product.type,
							price: product.price,
							serial_no: product.serial_no,
							Company: {
								connect: { id: company.id },
							},
							AddedByUser: {
								connect: { id: user.id },
							},
							Supplier: {
								connectOrCreate: {
									where: { supplier_name: product.supplier_name },
									create: {
										supplier_name: product.supplier_name,
										supplier_email: product.supplier_email || null,
										supplier_phone_no: product.supplier_phone_no,
										companyId: company.id,
									},
								},
							},
						},
					});
					results.push(result); // Collect the successful result
				} catch (error) {
					// If there's an error, catch it and store the error info
					errors.push({
						product: product.serial_no,
						error: `Product with serial number ${product.serial_no} already exists`,
					});
				}
			})
		);

		if (errors.length > 0) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: errors.map(e => e.error) });
		}

		res.status(StatusCodes.OK).json({ msg: "Products created" });
	},
	getProducts: async (req, res) => {
		const { product_name } = req.params;
		const products = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				product_name,
				sales_status: "NOT_SOLD",
			},
			include: {
				Supplier: {
					select: {
						supplier_name: true,
						supplier_email: true,
						supplier_phone_no: true,
					},
				},
			},
		});

		if (!products) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No products found with that name" });
		}

		res.status(StatusCodes.OK).json(products);
	},
	getProductWithCount: async (req, res) => {
		const productsByCount = await prisma.products.groupBy({
			where: { companyId: req.user.company_id, sales_status: "NOT_SOLD" },
			by: ["type", "brand", "product_name"],
			_count: {
				type: true,
			},
		});
		return res.status(StatusCodes.OK).json(productsByCount);
	},
	getProduct: async (req, res) => {
		const { serialNo } = req.params;

		const product = await prisma.products.findUnique({
			where: { serial_no: serialNo },
			include: {
				Supplier: {
					select: {
						supplier_name: true,
						supplier_email: true,
						supplier_phone_no: true,
					},
				},
			},
		});
		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Product not found", success: false });
		}

		res.status(StatusCodes.OK).json(product);
	},
	updateProduct: async (req, res) => {
		const { id } = req.params;

		const product = await prisma.products.findFirst({
			where: { id, sales_status: "NOT_SOLD" },
		});

		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Product not found", success: false });
		}

		const updatedProduct = await prisma.products.update({
			where: { id },
			data: req.body,
		});

		res.status(StatusCodes.OK).json({ msg: "updateProduct", updatedProduct });
	},
	sellProduct: async (req, res) => {
		const { serialNo } = req.params;
		const { buyer_name, buyer_email, amount_paid, buyer_phone_no } = req.body;

		const product = await prisma.products.findUnique({
			where: { serial_no: serialNo },
		});

		if (product.sold) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Product already sold", success: false });
		}

		const user = await prisma.users.findUnique({
			where: {
				email: req.user.email,
			},
		});

		const updatedProduct = await prisma.products.update({
			where: { serial_no: serialNo },
			data: {
				sales_status: "SOLD",
				SoldByUser: { connect: { id: user.id } },
				date_sold: new Date(),
				Customer: {
					connectOrCreate: {
						where: { buyer_name },
						create: {
							buyer_name,
							buyer_email: buyer_email || null,
							amount_paid,
							buyer_phone_no,
						},
					},
				},
			},
		});

		res
			.status(StatusCodes.OK)
			.json({ msg: "Successfully sold", updatedProduct });
	},
	getSoldProductsByName: async (req, res) => {
		const { product_name } = req.params;
		const soldProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SOLD",
				product_name,
			},
			include: {
				SoldByUser: {
					select: { first_name: true, last_name: true, email: true },
				},
				Customer: {
					select: {
						buyer_name: true,
						buyer_email: true,
						buyer_phone_no: true,
						amount_paid: true,
					},
				},
			},
		});
		res.status(StatusCodes.OK).json(soldProducts);
	},
	getCountOfSoldProducts: async (req, res) => {
		const productsByCount = await prisma.products.groupBy({
			where: { companyId: req.user.company_id, sales_status: "SOLD" },
			by: ["type", "brand", "product_name"],
			_count: {
				type: true,
			},
		});
		return res.status(StatusCodes.OK).json(productsByCount);
	},
};
