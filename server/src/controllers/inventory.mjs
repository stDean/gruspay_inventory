import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";
import { InvoiceNumber } from "invoice-number";

const useUserAndCompany = async ({ company_id, email }) => {
	const company = await prisma.company.findUnique({
		where: { id: company_id },
		include: { Products: { where: { sales_status: "NOT_SOLD" } } },
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

function generateInvoice(previousInvoice = "INV-0001") {
	// Generate the next invoice number based on the previous one
	const newInvoiceNumber = InvoiceNumber.next(previousInvoice);
	return newInvoiceNumber;
}

// check product length based on the payment plan
// const checkProductLength = (company, newProductsCount) => {
// 	const productLimits = {
// 		PERSONAL: 70,
// 		TEAM: 150,
// 		ENTERPRISE: 250,
// 	};

// 	const limit = productLimits[company.payment_plan];
// 	const currentProductCount = company.Products.length; // Assuming this is the list of current products in the company

// 	// Check if adding the new products will exceed the limit
// 	if (limit && currentProductCount + newProductsCount > limit) {
// 		return {
// 			error: true,
// 			msg: `Cannot add more products. Your plan allows a maximum of ${limit} products, and you currently have ${currentProductCount}. Please upgrade your plan.`,
// 		};
// 	}

// 	return {};
// };

// const checkToAddSingleProduct = company => {
// 	const productLimits = {
// 		PERSONAL: 70,
// 		TEAM: 150,
// 		ENTERPRISE: 250,
// 	};

// 	const limit = productLimits[company.payment_plan];
// 	if (limit && company.Products.length >= limit) {
// 		return {
// 			error: true,
// 			msg: `Maximum limit of ${limit} products reached. Upgrade your plan to add more.`,
// 		};
// 	}

// 	return {};
// };

/**
 * TODO:
 * for the sellProductsBulk and updateSoldProduct we need to create an invoice
 * the invoice would be sent to both the backend and the users email.
 */

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

		// const productLengthCheck = checkToAddSingleProduct(company);
		// if (productLengthCheck.error) {
		// 	return res.status(StatusCodes.BAD_REQUEST).json({
		// 		msg: productLengthCheck.msg,
		// 	});
		// }

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

		// Check the product length synchronously (handle errors via return)
		// const productLengthCheck = checkProductLength(company, req.body.length);
		// if (productLengthCheck.error) {
		// 	return res.status(StatusCodes.BAD_REQUEST).json({
		// 		msg: productLengthCheck.msg,
		// 	});
		// }

		for (const product of req.body) {
			try {
				const supplier = await getOrCreateSupplier({
					supplier_email: product["Supplier Email"],
					supplier_name: product["Supplier Name"],
					supplier_phone_no: product["Supplier Phone Number"],
					companyId: company.id,
				});

				// Now create the product with the connected supplier
				const result = await prisma.products.create({
					data: {
						product_name: product["Product Name"],
						brand: product.Brand,
						description: product.Description,
						type: product["Item Type"],
						price: product.Price,
						serial_no: product["Serial Number"],
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
				console.log({ error });
				errors.push({
					product: product.serial_no,
					error: `Error creating product with serial number ${product.serial_no}: ${error.message}`,
				});
			}
		}

		// Handle errors if any
		if (errors.length > 0) {
			const serialNo = errors.map(error => error.product);
			const errorMsg =
				serialNo.length > 10
					? "Some of the products already exist."
					: `Products with serial numbers ${serialNo.join(
							", "
					  )} already exist.`;
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: errorMsg });
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
		const { type, brand } = req.params;
		const products = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
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
			by: ["type", "brand"],
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
	sellProductsBulk: async (req, res) => {
		let { products, buyer_name, buyer_email, buyer_phone_no, balance_owed } =
			req.body;
		const { company_id, email } = req.user;

		// Ensure products is always an array
		if (!Array.isArray(products)) {
			products = [products];
		}

		const user = await prisma.users.findUnique({ where: { email } });
		const results = { success: [], failed: [] };
		const serialNumbers = products.map(product => product.serialNo);

		// Step 1: Batch retrieve products for sale processing
		const retrievedProducts = await prisma.products.findMany({
			where: {
				serial_no: { in: serialNumbers },
				companyId: company_id,
				sales_status: "NOT_SOLD",
			},
		});

		if (retrievedProducts.length === 0) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Products not found.", success: false });
		}

		const productMap = new Map(
			retrievedProducts.map(product => [product.serial_no, product])
		);

		// Generate a single invoice number for the transaction
		const company = await prisma.company.findUnique({
			where: { id: company_id },
		});
		const companyInitials = company.company_name
			.split(" ")
			.map(name => name[0])
			.join("");
		const getYearAndDate = new Date();
		const yearLastTwo = getYearAndDate.getFullYear().toString().substr(-2);
		const month = (getYearAndDate.getMonth() + 1).toString().padStart(2, "0");
		const getPrevInvoice = await prisma.invoice.findMany({
			where: { companyId: company_id },
			orderBy: { invoiceNo: "desc" },
			take: 1,
		});
		const prev =
			getPrevInvoice[0]?.invoiceNo ||
			`${companyInitials}${yearLastTwo}-${month}0001`;
		const invoiceNumber = generateInvoice(prev);

		// Update each product and prepare invoice creation data
		for (let { serialNo, amount_paid } of products) {
			const product = productMap.get(serialNo);
			if (!product) {
				results.failed.push({ serialNo, reason: "Not found or already sold" });
				continue;
			}

			// Prepare product update data
			const updateData = {
				sales_status: "SOLD",
				SoldByUser: { connect: { id: user.id } },
				date_sold: new Date(),
				bought_for: amount_paid || product.price,
				balance_owed: balance_owed || "0",
			};

			if (balance_owed) {
				updateData["Creditor"] = {
					connectOrCreate: {
						where: {
							creditor_email_creditor_name_companyId: {
								creditor_name: buyer_name,
								creditor_email: buyer_email,
								companyId: company_id,
							},
						},
						create: {
							creditor_name: buyer_name,
							creditor_email: buyer_email,
							creditor_phone_no: buyer_phone_no,
							companyId: company_id,
						},
					},
				};
			} else {
				updateData["Customer"] = {
					connectOrCreate: {
						where: {
							buyer_email_buyer_name_companyId: {
								buyer_email,
								buyer_name,
								companyId: company_id,
							},
						},
						create: {
							buyer_name,
							buyer_email: buyer_email || null,
							buyer_phone_no,
							companyId: company_id,
						},
					},
				};
			}

			await prisma.products.update({
				where: { id: product.id },
				data: updateData,
			});

			results.success.push({ serialNo, updatedProduct: product });
		}

		// Step 2: Create the invoice with all products connected
		const baseInvoiceData = {
			company: { connect: { id: company_id } },
			invoiceNo: invoiceNumber,
			product: {
				connect: retrievedProducts.map(product => ({ id: product.id })),
			},
			status: balance_owed ? "OUTSTANDING" : "PAID",
			balance_due: balance_owed ? String(balance_owed) : "0",
		};

		if (balance_owed) {
			baseInvoiceData.creditor = {
				connectOrCreate: {
					where: {
						creditor_email_creditor_name_companyId: {
							creditor_name: buyer_name,
							creditor_email: buyer_email,
							companyId: company_id,
						},
					},
					create: {
						creditor_name: buyer_name,
						creditor_email: buyer_email,
						creditor_phone_no: buyer_phone_no,
						companyId: company_id,
					},
				},
			};
		} else {
			baseInvoiceData.customer = {
				connectOrCreate: {
					where: {
						buyer_email_buyer_name_companyId: {
							buyer_email,
							buyer_name,
							companyId: company_id,
						},
					},
					create: {
						buyer_name,
						buyer_email: buyer_email || null,
						buyer_phone_no,
						companyId: company_id,
					},
				},
			};
		}

		const createdInvoice = await prisma.invoice.create({
			data: baseInvoiceData,
		});

		// Step 3: Link products to the created invoice
		await Promise.all(
			retrievedProducts.map(product =>
				prisma.products.update({
					where: { id: product.id },
					data: { Invoice: { connect: { id: createdInvoice.id } } },
				})
			)
		);

		return res.status(StatusCodes.OK).json({
			msg: "Product(s) sale completed.",
			results,
		});
	},
	getSoldProductsByName: async (req, res) => {
		const { type, brand } = req.params;
		const soldProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SOLD",
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
			by: ["type", "brand"],
			_count: {
				type: true,
			},
		});
		return res.status(StatusCodes.OK).json(productsByCount);
	},
	getSwapProductsByName: async (req, res) => {
		const { type, brand } = req.params;
		const swapProducts = await prisma.products.findMany({
			where: {
				companyId: req.user.company_id,
				sales_status: "SWAP",
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
			by: ["type", "brand"],
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

		const updatedProduct = await prisma.products.update({
			where: { id: outgoingProduct.id },
			data: {
				sales_status: "SWAP",
				SoldByUser: { connect: { id: user.id } },
				date_sold: new Date(),
				bought_for: customerInfo.amount_paid,
				balance_owed: "0",
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

		// Generate invoice for the swap transaction
		const prevInvoice = await prisma.invoice.findMany({
			where: { companyId: company.id },
			orderBy: { invoiceNo: "desc" },
			take: 1,
		});
		const invoiceNumber = generateInvoice(prevInvoice[0]?.invoiceNo);
		await prisma.invoice.create({
			data: {
				company: { connect: { id: company.id } },
				product: { connect: { id: updatedProduct.id } },
				invoiceNo: invoiceNumber,
				status: "SWAP",
				balance_due: "0",
				customer: {
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
			},
		});

		return res.status(StatusCodes.OK).json({ updatedProduct });
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
		const topSoldProduct =
			allSoldProducts.length !== 0
				? allSoldProducts.reduce((prev, current) =>
						prev._count.product_name > current._count.product_name
							? prev
							: current
				  )
				: 0;

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
		const { soldYear, soldMonth, sellerMonth, sellerYear, tssYear, tssMonth } =
			req.query;

		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;

		// Helper function for generating date filters
		const getDateRange = (year, month) => ({
			gte: new Date(
				`${Number(year)}-${Number(month)
					.toString()
					.padStart(2, "0")}-01T00:00:00.000Z`
			), // Start of the month
			lt: new Date(
				`${Number(year)}-${(Number(month) + 1)
					.toString()
					.padStart(2, "0")}-01T00:00:00.000Z`
			), // Start of the next month
		});

		// SOLD AND PURCHASE LOGIC
		const soldFilter = {
			soldYear: soldYear ? soldYear : currentYear,
			soldMonth: soldMonth ? soldMonth : currentMonth,
		};

		// Get total sales amount and convert prices from string to float
		const soldProducts = await prisma.products.findMany({
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				date_sold: getDateRange(soldFilter.soldYear, soldFilter.soldMonth),
			},
			select: { bought_for: true },
		});

		const totalSoldPrice =
			soldProducts.length !== 0
				? soldProducts.reduce(
						(sum, product) => sum + (parseFloat(product.bought_for) || 0),
						0
				  )
				: 0;

		// Get total item sold count
		const totalSalesCount = await prisma.products.count({
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				date_sold: getDateRange(soldFilter.soldYear, soldFilter.soldMonth),
			},
		});

		// Get total purchases and purchase price
		const allProductsPrice = await prisma.products.findMany({
			where: {
				companyId,
				createdAt: getDateRange(soldFilter.soldYear, soldFilter.soldMonth),
			},
			select: { price: true },
		});

		const totalPurchasePrice =
			allProductsPrice.length !== 0
				? allProductsPrice.reduce(
						(sum, product) => sum + (parseFloat(product.price) || 0),
						0
				  )
				: 0;
		const totalPurchasesCount = allProductsPrice.length;

		// TOP SELLER LOGIC
		const topSellerFilter = {
			sellerYear: sellerYear ? sellerYear : currentYear,
			sellerMonth: sellerMonth ? sellerMonth : currentMonth,
		};

		// Get top seller based on sold product count
		const topSoldProductAndUser = await prisma.products.groupBy({
			by: ["sold_by"],
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				date_sold: getDateRange(
					topSellerFilter.sellerYear,
					topSellerFilter.sellerMonth
				),
			},
			_count: { sold_by: true },
		});

		const topSellerUserId =
			topSoldProductAndUser.length !== 0
				? topSoldProductAndUser.reduce((prev, current) => {
						console.log({ prev, current });
						return prev._count.sold_by > current._count.sold_by
							? prev
							: current;
				  })
				: null;

		const topSeller =
			topSellerUserId &&
			(await prisma.users.findUnique({
				where: { companyId, id: topSellerUserId.sold_by },
			}));

		const topSellerProducts =
			topSeller &&
			(await prisma.products.findMany({
				where: {
					companyId,
					sold_by: topSeller.id,
					sales_status: { not: "NOT_SOLD" },
					date_sold: getDateRange(
						topSellerFilter.sellerYear,
						topSellerFilter.sellerMonth
					),
				},
				select: { bought_for: true },
			}));

		const topSellerPrice = topSellerProducts
			? topSellerProducts.reduce(
					(sum, product) => sum + (parseFloat(product.bought_for) || 0),
					0
			  )
			: 0;

		// BUSINESS SUMMARY LOGIC
		const stockCount = await prisma.products.count({
			where: { companyId, sales_status: "NOT_SOLD" },
		});

		const unsoldProducts = await prisma.products.findMany({
			where: { companyId, sales_status: "NOT_SOLD" },
			select: { price: true, product_name: true, id: true },
		});

		const totalUnsoldPrice =
			unsoldProducts.length !== 0
				? unsoldProducts.reduce(
						(sum, product) => sum + (parseFloat(product.price) || 0),
						0
				  )
				: 0;

		const suppliersCount = await prisma.supplier.count({
			where: { companyId },
		});
		const customersCount = await prisma.buyer.count({ where: { companyId } });

		const productCounts =
			unsoldProducts.length !== 0
				? unsoldProducts.reduce((acc, product) => {
						acc[product.product_name] = (acc[product.product_name] || 0) + 1;
						return acc;
				  }, {})
				: 0;

		const lowQuantityProducts = Object.entries(productCounts)
			.filter(([_, count]) => count < 5)
			.sort((a, b) => a[1] - b[1])
			.slice(0, 5)
			.map(([product_name, count]) => ({ product_name, count }));

		// TOP SELLING STOCK LOGIC
		const tssFilter = {
			tssMonth: tssMonth ? tssMonth : currentMonth,
			tssYear: tssYear ? tssYear : currentYear,
		};

		const topSellingProducts = await prisma.products.groupBy({
			by: ["product_name"],
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				date_sold: getDateRange(tssFilter.tssYear, tssFilter.tssMonth),
			},
			_count: { product_name: true },
			orderBy: { _count: { product_name: "desc" } },
			take: 5,
		});

		const topSellingWithDetails = topSellingProducts
			? await Promise.all(
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
			  )
			: [];

		// Return all gathered stats
		return res.status(200).json({
			totalSoldPrice,
			totalSalesCount,
			totalPurchasesCount,
			totalPurchasePrice,
			topSellerDetail: {
				first_name: topSeller ? topSeller.first_name : "",
				last_name: topSeller ? topSeller.last_name : "",
				count: topSellerUserId ? topSellerUserId._count.sold_by : 0,
				totalPrice: topSellerPrice ? topSellerPrice : 0,
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
		const { barYear } = req.query;

		const selectedYear = barYear ? Number(barYear) : new Date().getFullYear();

		// Fetch sold products grouped by month
		const soldProducts = await prisma.products.findMany({
			where: {
				companyId: company_id,
				sales_status: { not: "NOT_SOLD" },
				createdAt: {
					gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`), // Start of the year
					lt: new Date(`${Number(selectedYear) + 1}-01-01T00:00:00.000Z`), // Start of the next year
				},
			},
			select: {
				bought_for: true,
				date_sold: true, // Assuming you have a date_sold field
			},
		});

		// Fetch purchased products grouped by month
		const purchasedProducts = await prisma.products.findMany({
			where: {
				companyId: company_id,
				createdAt: {
					gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`), // Start of the year
					lt: new Date(`${Number(selectedYear) + 1}-01-01T00:00:00.000Z`), // Start of the next year
				},
			},
			select: {
				price: true,
				createdAt: true, // Assuming the purchase date is the createdAt field
			},
		});

		// Helper function to get month name from date
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

		const getMonthName = date => {
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

		// Group sold and purchased products by month
		const groupedSoldProducts = groupByMonth(soldProducts, "date_sold");
		const groupedPurchasedProducts = groupByMonth(
			purchasedProducts,
			"createdAt"
		);

		// Sum up sales and purchases for each month
		const calculateTotalForMonth = (products, priceField) => {
			return products.reduce((sum, product) => {
				const price = parseFloat(product[priceField]) || 0;
				return sum + price;
			}, 0);
		};

		// Merge sales and purchases into a single dataset
		const allMonths = new Set([
			...Object.keys(groupedSoldProducts),
			...Object.keys(groupedPurchasedProducts),
		]);

		const data = Array.from(allMonths).map(month => ({
			month,
			"monthly sales": calculateTotalForMonth(
				groupedSoldProducts[month] || [],
				"bought_for"
			),
			"monthly purchases": calculateTotalForMonth(
				groupedPurchasedProducts[month] || [],
				"price"
			),
		}));

		data.sort(
			(a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
		);

		return res.status(200).json({ data });
	},
	updateSoldProduct: async (req, res) => {
		const {
			user: { company_id },
			params: { id },
			body: { amount, invoiceId },
		} = req;

		// Find the sold product with a balance owed
		const product = await prisma.products.findFirst({
			where: {
				companyId: company_id,
				id: id,
				sales_status: "SOLD",
				balance_owed: { not: "0" },
			},
			include: { Creditor: { include: { Products: true } } },
		});

		// If product not found, return error
		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Product not found", success: false });
		}

		// Calculate the updated balance
		const balance = Number(product.balance_owed) - Number(amount);

		// Prevent overpayment
		if (balance < 0) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Cannot pay more than balance owed", success: false });
		}

		// Update product when there's still balance owed
		const updatedData = {
			balance_owed: String(balance),
			date_sold: new Date(),
			bought_for: String(Number(amount) + Number(product.bought_for)),
		};

		// When balance is fully paid, update customer information
		if (balance === 0) {
			updatedData["Customer"] = {
				connectOrCreate: {
					where: {
						buyer_email_buyer_name_companyId: {
							buyer_email: product.Creditor.creditor_email,
							buyer_name: product.Creditor.creditor_name,
							companyId: product.companyId,
						},
					},
					create: {
						buyer_email: product.Creditor.creditor_email,
						buyer_name: product.Creditor.creditor_name,
						buyer_phone_no: product.Creditor.creditor_phone_no,
						companyId: product.companyId,
					},
				},
			};
		}

		// Update product with the new balance and customer info
		const updatedProduct = await prisma.products.update({
			where: { id: product.id },
			data: updatedData,
		});

		// Find the invoice associated with this product
		const invoice = await prisma.invoice.findUnique({
			where: { companyId: company_id, id: invoiceId },
		});

		if (invoice) {
			// Update the invoice balance
			const updatedInvoiceData = { balance_due: String(balance) };

			// If balance is zero, mark the invoice as paid in full
			if (balance === 0) {
				updatedInvoiceData["status"] = "PAID";
        updatedInvoiceData["customerId"] = updatedProduct.buyerId || null;
			}

			// Update the invoice in the database
			await prisma.invoice.update({
				where: { id: invoice.id },
				data: updatedInvoiceData,
			});
		}

		// If balance is zero, disconnect the product from the creditor
		if (balance === 0) {
			await prisma.creditor.update({
				where: { id: product.Creditor.id },
				data: {
					Products: { disconnect: { id: product.id } },
				},
			});

			// Check if the creditor has no more products, and delete if empty
			const creditorProducts = await prisma.products.findMany({
				where: { Creditor: { id: product.Creditor.id } },
			});

			if (creditorProducts.length === 0) {
				await prisma.creditor.delete({
					where: { id: product.Creditor.id },
				});
			}
		}

		// TODO:send invoice to the user with the money they paid and if their is a balance add it

		// Return success message
		return res
			.status(StatusCodes.OK)
			.json({ msg: "Product sold successfully", success: true });
	},
};
