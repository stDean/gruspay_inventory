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
			supplier_email_supplier_name_companyId: {
				supplier_email: supplier_email || null,
				supplier_name,
				companyId,
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
			where: { serial_no_companyId: { serial_no, companyId: company_id } },
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

				console.log({ result });

				results.push(result); // Collect the successful result
			} catch (error) {
				console.log({ error });
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
			where: {
				serial_no_companyId: {
					serial_no: serialNo,
					companyId: req.user.company_id,
				},
			},
			include: {
				Supplier: {
					select: {
						supplier_name: true,
						supplier_email: true,
						supplier_phone_no: true,
					},
				},
				Customer: {
					select: {
						buyer_name: true,
						buyer_email: true,
						buyer_phone_no: true,
					},
				},
				OutgoingProduct: { include: { incomingProducts: true } },
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
			where: {
				serial_no_companyId: {
					serial_no: serialNo,
					companyId: req.user.company_id,
				},
			},
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
			where: {
				serial_no_companyId: {
					serial_no: serialNo,
					companyId: req.user.company_id,
				},
			},
			data: {
				sales_status: "SOLD",
				SoldByUser: { connect: { id: user.id } },
				date_sold: new Date(),
				bought_for: amount_paid,
				Customer: {
					connectOrCreate: {
						where: {
							buyer_email_buyer_name_companyId: {
								buyer_email,
								buyer_name,
								companyId: req.user.company_id,
							},
						},
						create: {
							buyer_name,
							buyer_email: buyer_email || null,
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
					},
				},
				Supplier: true,
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
	getSwapProductsByName: async (req, res) => {
		const { product_name } = req.params;
		const swapProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SWAP",
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
					},
				},
				OutgoingProduct: { include: { incomingProducts: true } },
				Supplier: true,
			},
		});

		res.status(StatusCodes.OK).json({ swapProducts });
	},
	getCountOfSwapProducts: async (req, res) => {
		const productsByCount = await prisma.products.groupBy({
			where: { companyId: req.user.company_id, sales_status: "SWAP" },
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

		// Ensure there are outgoing products
		if (!outgoing || outgoing.length === 0) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No products to swap", success: false });
		}

		// Find outgoing products that match the given serial numbers, belong to the company, and are not yet sold
		const outgoingProduct = await prisma.products.findUnique({
			where: {
				serial_no_companyId: {
					serial_no: outgoing,
					companyId: company.id,
				},
				sales_status: "NOT_SOLD",
			},
		});

		// If no outgoing products are found, return an error
		if (!outgoingProduct) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "No valid product to swap", success: false });
		}

		// Validate customer info
		if (
			!customerInfo ||
			!customerInfo.buyer_name ||
			!customerInfo.amount_paid ||
			!customerInfo.phone_no
		) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Customer information is required." });
		}

		const supplier = await getOrCreateSupplier({
			supplier_name: customerInfo.buyer_name,
			supplier_email: customerInfo.buyer_email || null,
			supplier_phone_no: customerInfo.phone_no,
			companyId: company.id,
		});

		const swap = await prisma.swaps.create({
			data: {
				Company: { connect: { id: company.id } },
				incomingProducts: {
					create: incoming.map(product => ({
						product_name: product.product_name,
						brand: product.brand,
						description: product.description,
						type: product.type,
						price: product.price,
						serial_no: product.serial_no,
						Company: { connect: { id: company.id } },
						AddedByUser: { connect: { id: user.id } },
						Supplier: { connect: { id: supplier.id } },
					})),
				},
			},
		});

		const updateProductWithSwap = await prisma.products.update({
			where: { id: outgoingProduct.id },
			data: {
				sales_status: "SWAP",
				SoldByUser: { connect: { id: user.id } },
				date_sold: new Date(),
				bought_for: customerInfo.amount_paid,
				Customer: {
					connectOrCreate: {
						where: {
							buyer_email_buyer_name_companyId: {
								buyer_name: customerInfo.buyer_name,
								buyer_email: customerInfo.buyer_email || null,
								companyId: company.id,
							},
						},
						create: {
							buyer_name: customerInfo.buyer_name,
							buyer_email: customerInfo.buyer_email || null,
							buyer_phone_no: customerInfo.phone_no,
							companyId: company.id,
						},
					},
				},
				OutgoingProduct: { connect: { id: swap.id } },
			},
		});

		return res.status(StatusCodes.OK).json({ updateProductWithSwap });
	},
	getInventoryStats: async (req, res) => {
		const allCategoryNotSold = await prisma.products.groupBy({
			where: { companyId: req.user.company_id, sales_status: "NOT_SOLD" },
			by: ["type"],
			_count: {
				type: true,
			},
		});

		const allCategorySold = await prisma.products.groupBy({
			where: { companyId: req.user.company_id, sales_status: "SOLD" },
			by: ["type"],
			_count: {
				type: true,
			},
		});

    const allCategorySwap = await prisma.products.groupBy({
			where: { companyId: req.user.company_id, sales_status: "SWAP" },
			by: ["type"],
			_count: {
				type: true,
			},
		});

		const totalInventoryCount = await prisma.products.count({
			where: { companyId: req.user.company_id, sales_status: "NOT_SOLD" },
		});

		const totalSalesCount = await prisma.products.count({
			where: { companyId: req.user.company_id, sales_status: "SOLD" },
		});

    const totalSwapCount = await prisma.products.count({
			where: { companyId: req.user.company_id, sales_status: "SWAP" },
		});

		const unsoldProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "NOT_SOLD",
			},
			select: {
				price: true,
			},
		});

		// Convert the string prices to numbers and sum them up
		const totalPrice = unsoldProducts.reduce((sum, product) => {
			const price = parseFloat(product.price) || 0; // Convert price to a float, fallback to 0 if conversion fails
			return sum + price;
		}, 0);

		const soldProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SOLD",
			},
			select: {
				bought_for: true,
			},
		});

		// Convert the string prices to numbers and sum them up
		const totalSoldPrice = soldProducts.reduce((sum, product) => {
			const price = parseFloat(product.bought_for) || 0; // Convert price to a float, fallback to 0 if conversion fails
			return sum + price;
		}, 0);

    const swapProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SWAP",
			},
			select: {
				bought_for: true,
			},
		});

		// Convert the string prices to numbers and sum them up
		const totalSwapPrice = swapProducts.reduce((sum, product) => {
			const price = parseFloat(product.bought_for) || 0; // Convert price to a float, fallback to 0 if conversion fails
			return sum + price;
		}, 0);

		const allSoldProduct = await prisma.products.groupBy({
			by: ["product_name"],
			where: {
				companyId: req.user.company_id,
				sales_status: { not: "NOT_SOLD" },
			},
			_count: {
				product_name: true,
			},
		});

		// Now, find the product with the maximum count
		const topSoldProduct = allSoldProduct.reduce((prev, current) => {
			return prev._count.product_name > current._count.product_name
				? prev
				: current;
		});

		return res.status(StatusCodes.OK).json({
			allCategoryNotSold,
			totalInventoryCount,
			totalPrice,
			topSoldProduct,
			allCategorySold,
			totalSalesCount,
			totalSoldPrice,
      allCategorySwap,
      totalSwapCount,
      totalSwapPrice
		});
	},
};
