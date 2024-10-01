import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";

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
		const { product_name, type, brand } = req.params;
		const products = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				product_name,
				sales_status: "NOT_SOLD",
				type,
				brand,
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
		const { product_name, type, brand } = req.params;
		const soldProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SOLD",
				product_name,
				type,
				brand,
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
		const { product_name, type, brand } = req.params;
		const swapProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SWAP",
				product_name,
				type,
				brand,
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

		const incomingProductsData = incoming.map(product => ({
			product_name: product.product_name,
			brand: product.brand,
			description: product.description,
			type: product.type,
			price: product.price,
			serial_no: product.serial_no,
			Company: { connect: { id: company.id } },
			AddedByUser: { connect: { id: user.id } },
			Supplier: { connect: { id: supplier.id } },
		}));

		const swap = await prisma.swaps.create({
			data: {
				Company: { connect: { id: company.id } },
				incomingProducts: { create: incomingProductsData },
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
		const companyId = req.user.company_id;

		// Helper function to get grouped product counts by type and sales status
		const getCategoryCountByStatus = async status => {
			return await prisma.products.groupBy({
				where: { companyId, sales_status: status },
				by: ["type"],
				_count: { type: true },
			});
		};

		// Helper function to get total prices by sales status
		const getTotalPriceByStatus = async (status, priceField = "price") => {
			const products = await prisma.products.findMany({
				where: { companyId, sales_status: status },
				select: { [priceField]: true },
			});
			return products.reduce(
				(sum, product) => sum + (parseFloat(product[priceField]) || 0),
				0
			);
		};

		// Get grouped product counts for NOT_SOLD, SOLD, and SWAP statuses
		const [allCategoryNotSold, allCategorySold, allCategorySwap] =
			await Promise.all([
				getCategoryCountByStatus("NOT_SOLD"),
				getCategoryCountByStatus("SOLD"),
				getCategoryCountByStatus("SWAP"),
			]);

		// Get total counts for NOT_SOLD, SOLD, and SWAP statuses
		const [totalInventoryCount, totalSalesCount, totalSwapCount] =
			await Promise.all([
				prisma.products.count({
					where: { companyId, sales_status: "NOT_SOLD" },
				}),
				prisma.products.count({ where: { companyId, sales_status: "SOLD" } }),
				prisma.products.count({ where: { companyId, sales_status: "SWAP" } }),
			]);

		// Get total prices for NOT_SOLD, SOLD, and SWAP products
		const [totalPrice, totalSoldPrice, totalSwapPrice] = await Promise.all([
			getTotalPriceByStatus("NOT_SOLD"),
			getTotalPriceByStatus("SOLD", "bought_for"),
			getTotalPriceByStatus("SWAP", "bought_for"),
		]);

		// Get all sold products grouped by product_name
		const allSoldProducts = await prisma.products.groupBy({
			by: ["product_name"],
			where: { companyId, sales_status: { not: "NOT_SOLD" } },
			_count: { product_name: true },
		});

		// Find the product with the highest sold count
		const topSoldProduct = allSoldProducts.reduce((prev, current) =>
			prev._count.product_name > current._count.product_name ? prev : current
		);

		// Return the aggregated inventory statistics
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
			totalSwapPrice,
		});
	},
	getDashboardStats: async (req, res) => {
		const companyId = req.user.company_id;

		// 1. Get total sales amount and convert prices from string to float
		const soldProducts = await prisma.products.findMany({
			where: { companyId, sales_status: { not: "NOT_SOLD" } },
			select: { bought_for: true },
		});
		const totalSoldPrice = soldProducts.reduce(
			(sum, product) => sum + (parseFloat(product.bought_for) || 0),
			0
		);

		// 2. Get total item sold count
		const totalSalesCount = await prisma.products.count({
			where: { companyId, sales_status: { not: "NOT_SOLD" } },
		});

		// 3. Get total purchases and purchase price
		const allProductsPrice = await prisma.products.findMany({
			where: { companyId },
			select: { price: true },
		});
		const totalPurchasePrice = allProductsPrice.reduce(
			(sum, product) => sum + (parseFloat(product.price) || 0),
			0
		);
		const totalPurchasesCount = allProductsPrice.length;

		// 4. Get top seller based on sold product count
		const topSoldProductAndUser = await prisma.products.groupBy({
			by: ["sold_by"],
			where: { companyId, sales_status: { not: "NOT_SOLD" } },
			_count: { sold_by: true },
		});
		const topSellerUserId = topSoldProductAndUser.reduce((prev, current) =>
			prev._count.sold_by > current._count.sold_by ? prev : current
		);

		// 5. Get top seller user info and total price of products sold by them
		const topSeller = await prisma.users.findUnique({
			where: { companyId, id: topSellerUserId.sold_by },
			include: { Sold_Products: { select: { id: true } } },
		});
		const topSellerProducts = await prisma.products.findMany({
			where: {
				companyId,
				id: { in: topSeller.Sold_Products.map(product => product.id) },
			},
			select: { bought_for: true },
		});
		const topSellerPrice = topSellerProducts.reduce(
			(sum, product) => sum + (parseFloat(product.bought_for) || 0),
			0
		);

		// 6. Get business summary: stock count, total unsold price, suppliers, customers
		const stockCount = await prisma.products.count({
			where: { companyId, sales_status: "NOT_SOLD" },
		});
		const unsoldProducts = await prisma.products.findMany({
			where: { companyId, sales_status: "NOT_SOLD" },
			select: { price: true, product_name: true, id: true },
		});
		const totalUnsoldPrice = unsoldProducts.reduce(
			(sum, product) => sum + (parseFloat(product.price) || 0),
			0
		);
		const suppliersCount = await prisma.supplier.count({
			where: { companyId },
		});
		const customersCount = await prisma.buyer.count({ where: { companyId } });

		// 7. Get low quantity products (less than 5 items)
		const productCounts = unsoldProducts.reduce((acc, product) => {
			acc[product.product_name] = (acc[product.product_name] || 0) + 1;
			return acc;
		}, {});
		const lowQuantityProducts = Object.entries(productCounts)
			.filter(([_, count]) => count < 5)
			.sort((a, b) => a[1] - b[1])
			.slice(0, 5)
			.map(([product_name, count]) => ({ product_name, count }));

		// 8. Get top-selling products and remaining unsold quantity
		const topSellingProducts = await prisma.products.groupBy({
			by: ["product_name"],
			where: { companyId, sales_status: "SOLD" },
			_count: { product_name: true },
			orderBy: { _count: { product_name: "desc" } },
			take: 5,
		});
		const topSellingWithDetails = await Promise.all(
			topSellingProducts.map(async product => {
				const soldProducts = await prisma.products.findMany({
					where: {
						product_name: product.product_name,
						companyId,
						sales_status: "SOLD",
					},
					select: { bought_for: true },
				});
				const totalSoldPrice = soldProducts.reduce(
					(sum, p) => sum + (parseFloat(p.bought_for) || 0),
					0
				);
				const remainingQuantity = await prisma.products.count({
					where: {
						product_name: product.product_name,
						companyId,
						sales_status: "NOT_SOLD",
					},
				});
				return {
					product_name: product.product_name,
					total_sold: product._count.product_name,
					total_sold_price: totalSoldPrice,
					remaining_quantity: remainingQuantity,
				};
			})
		);

		// Return all gathered stats
		return res.status(200).json({
			totalSoldPrice,
			totalSalesCount,
			totalPurchasesCount,
			totalPurchasePrice,
			topSellerDetail: {
				first_name: topSeller.first_name,
				last_name: topSeller.last_name,
				count: topSellerUserId._count.sold_by,
				totalPrice: topSellerPrice,
			},
			businessSummary: {
				stockCount,
				totalUnsoldPrice,
				suppliers: suppliersCount,
				customers: customersCount,
			},
			lowQuantityProducts,
			topSellingWithDetails,
		});
	},
	getMonthlySalesAndPurchases: async (req, res) => {
		const { company_id } = req.user;

		// Step 1: Fetch sold products grouped by month
		const soldProducts = await prisma.products.findMany({
			where: {
				companyId: company_id,
				sales_status: { not: "NOT_SOLD" },
			},
			select: {
				bought_for: true,
				date_sold: true, // Assuming you have a date_sold field
			},
		});

		// Step 2: Fetch purchased products grouped by month
		const purchasedProducts = await prisma.products.findMany({
			where: { companyId: company_id },
			select: {
				price: true,
				createdAt: true, // Assuming the purchase date is the createdAt field
			},
		});

		// Helper function to get month name from date
		const getMonthName = date => {
			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];
			return monthNames[date.getMonth()]; // getMonth() returns 0-11 index
		};

		// Helper function to group products by month and year
		const groupByMonth = (products, dateField) => {
			return products.reduce((acc, product) => {
				const date = new Date(product[dateField]);
				const monthKey = getMonthName(date); // Just the month name

				if (!acc[monthKey]) {
					acc[monthKey] = [];
				}
				acc[monthKey].push(product);
				return acc;
			}, {});
		};

		// Step 3: Group sold and purchased products by month
		const groupedSoldProducts = groupByMonth(soldProducts, "date_sold");
		const groupedPurchasedProducts = groupByMonth(
			purchasedProducts,
			"createdAt"
		);

		// Step 4: Sum up sales and purchases for each month
		const calculateTotalForMonth = (products, priceField) => {
			return products.reduce((sum, product) => {
				const price = parseFloat(product[priceField]) || 0;
				return sum + price;
			}, 0);
		};

		// Step 5: Merge sales and purchases into a single dataset
		const allMonths = new Set([
			...Object.keys(groupedSoldProducts),
			...Object.keys(groupedPurchasedProducts),
		]);

		const data = Array.from(allMonths).map(month => ({
			month,
			"monthly sale": calculateTotalForMonth(
				groupedSoldProducts[month] || [],
				"bought_for"
			),
			"monthly purchase": calculateTotalForMonth(
				groupedPurchasedProducts[month] || [],
				"price"
			),
		}));

		return res.status(200).json({ data });
	},
};
