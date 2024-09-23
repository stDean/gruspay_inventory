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

// Helper function to handle supplier lookup or creation
const getOrCreateSupplier = async supplierData => {
	const { supplier_email, supplier_name, supplier_phone_no, companyId } =
		supplierData;

	const existingSupplier = await prisma.supplier.findUnique({
		where: {
			supplier_email_supplier_name: {
				supplier_email: supplier_email || null,
				supplier_name,
			},
		},
	});

	return (
		existingSupplier ||
		(await prisma.supplier.create({
			data: {
				supplier_name,
				supplier_email: supplier_email || null,
				supplier_phone_no,
				companyId,
			},
		}))
	);
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

		const supplier = await getOrCreateSupplier({
			supplier_email: supplier_email || null,
			supplier_name,
			supplier_phone_no,
			companyId: company.id,
		});

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
				Supplier: { connect: { id: supplier.id } },
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

		for (const product of req.body) {
			try {
				const supplier = await getOrCreateSupplier({
					supplier_email: product.supplier_email,
					supplier_name: product.supplier_name,
					supplier_phone_no: product.supplier_phone_no,
					companyId: company.id,
				});

				// Now create the product with the connected supplier
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
							connect: { id: supplier.id },
						},
					},
				});

				results.push(result); // Collect the successful result
			} catch (error) {
				errors.push({
					product: product.serial_no,
					error: `Error creating product with serial number ${product.serial_no}: ${error.message}`,
				});
			}
		}

		if (errors.length > 0) {
			const serialNo = errors.map(error => error.product);
			return res.status(StatusCodes.BAD_REQUEST).json({
				msg: `Products with serial number ${serialNo.join(
					", "
				)} already exists`,
			});
		}

		res.status(StatusCodes.OK).json({ msg: "Products created" });
	},
	getAllProductNotSold: async (req, res) => {
		const products = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "NOT_SOLD",
			},
		});

		return res.status(StatusCodes.OK).json(products);
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
              companyId: req.user.company_id,
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
	swapProducts: async (req, res) => {
		const {
			user: { company_id, email },
			body: { outgoing, customerInfo, incoming },
		} = req;
		const { company, user } = await useUserAndCompany({ company_id, email });

		// console.log({ a: req.body.incoming });
		if (outgoing.length === 0) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No products to swap", success: false });
		}

		const outgoingProducts = await prisma.products.findMany({
			where: {
				companyId: company.id,
				serial_no: { in: outgoing },
				sales_status: "NOT_SOLD",
			},
		});

		if (!outgoingProducts) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No products to swap", success: false });
		}

		const errors = [];
		const results = [];

		for (const product of incoming) {
			try {
				const supplier = await getOrCreateSupplier({
					supplier_name: customerInfo.buyer_name,
					supplier_email: customerInfo.buyer_email || null,
					supplier_phone_no: customerInfo.phone_no,
					companyId: company.id,
				});

				// Now create the product with the connected supplier
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
							connect: { id: supplier.id },
						},
					},
				});

				results.push(result); // Collect the successful result
			} catch (error) {
				errors.push({
					product: product.serial_no,
					error: `Error creating product with serial number ${product.serial_no}: ${error.message}`,
				});
			}
		}

		if (errors.length > 0) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: errors.map(e => e.error) });
		}

		for (const serial of outgoing) {
			await prisma.products.update({
				where: {
					serial_no: serial,
				},
				data: {
					SoldByUser: { connect: { id: user.id } }, // Connect SoldByUser for each product
					date_sold: new Date(),
					sales_status: "SWAP",
					Customer: {
						connectOrCreate: {
							where: {
								buyer_email_buyer_name: {
									buyer_name: customerInfo.buyer_name,
									buyer_email: customerInfo.buyer_email || null,
								},
							},
							create: {
								buyer_name: customerInfo.buyer_name,
								buyer_email: customerInfo.buyer_email || null,
								amount_paid: customerInfo.amount_paid,
								buyer_phone_no: customerInfo.phone_no,
                companyId: company.id
							},
						},
					},
				},
			});
		}

		return res
			.status(StatusCodes.OK)
			.json({ msg: "Products Swapped successfully" });
	},
};
