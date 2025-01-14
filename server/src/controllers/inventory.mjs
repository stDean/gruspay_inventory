import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";
import { InvoiceNumber } from "invoice-number";
import { sendNodeInvoice } from "../utils/sendMail.mjs";

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
			supplier_phone_no_supplier_name_companyId: {
				supplier_phone_no: supplier_phone_no || null,
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

function excelDateToJSDate(serial) {
	const excelEpoch = new Date(1900, 0, 1); // Excel's epoch starts on January 1, 1900
	const jsDate = new Date(excelEpoch.getTime() + (serial - 1) * 86400000); // Subtract 1 to adjust and multiply by ms per day
	return jsDate;
}

function formatDateToYYYYMMDD(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}/${month}/${day}`;
}

async function generateInvoiceNo(company_name, company_id) {
	const companyInitials = company_name
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
	const prevInvoiceWithoutFirstFour = getPrevInvoice[0]?.invoiceNo.slice(5);

	const prev = getPrevInvoice[0]?.invoiceNo
		? `${companyInitials}${yearLastTwo}-${prevInvoiceWithoutFirstFour}`
		: `${companyInitials}${yearLastTwo}-${month}0000`;
	const invoiceNumber = generateInvoice(prev);
	return invoiceNumber;
}

// Helper function for generating date filters
const getDateRange = (year, month) => {
	const startOfMonth = new Date(
		`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`
	);
	const endOfMonth = new Date(startOfMonth);
	endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1); // Go to next month
	endOfMonth.setUTCDate(0); // Set to last day of current month
	endOfMonth.setUTCHours(23, 59, 59, 999); // End of the day
	return { gte: startOfMonth, lte: endOfMonth };
};

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
				status,
				purchaseDate,
			},
		} = req;

		if (
			!product_name?.trim() ||
			!brand?.trim() ||
			!type?.trim() ||
			!description?.trim() ||
			!serial_no?.trim() ||
			!supplier_name?.trim() ||
			!supplier_phone_no?.trim() ||
			!status?.trim()
		) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Missing required fields for product creation" });
		}

		// TODO:desc character limit

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

		// remove comma and space
		const priceWithoutComma = String(price).replace(/^[₦#]|,?\s*/g, "");
		if (!Number(priceWithoutComma) && user.role === "ADMIN") {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid price" });
		}

		await prisma.products.create({
			data: {
				product_name,
				brand,
				description,
				type,
				price: user?.role === "ADMIN" ? priceWithoutComma : "0",
				serial_no,
				status: status.toUpperCase(),
				purchase_date: new Date(purchaseDate),
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

		// Fetch the company and user details based on the provided credentials
		const { company, user } = await useUserAndCompany({ company_id, email });

		const errors = []; // Collect errors during product creation
		const results = []; // Collect successful product creation results

		// Validate input data in bulk before processing
		const validationErrors = req.body
			.map((product, index) => {
				const missingFields = [];

				// Check for missing required fields and collect their names
				if (!product["Product Name"]?.trim())
					missingFields.push("Product Name");
				if (!product.Brand?.trim()) missingFields.push("Brand");
				if (!product["Item Type"]?.trim()) missingFields.push("Item Type");
				if (!String(product["Serial Number"])?.trim())
					missingFields.push("Serial Number");
				if (!product["Supplier Name"]?.trim())
					missingFields.push("Supplier Name");
				if (!String(product["Supplier Phone Number"])?.trim())
					missingFields.push("Supplier Phone Number");
				if (!product["Status"]?.trim()) missingFields.push("Status");

				// Return errors for products with missing fields
				return missingFields.length > 0 ? { index, missingFields } : null;
			})
			.filter(Boolean);

		// If there are validation errors, return them as a response
		if (validationErrors.length > 0) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				msg: "Validation errors in input data",
				errors: validationErrors,
			});
		}

		// Process each product in the request body
		for (const product of req.body) {
			try {
				// Sanitize input data by trimming whitespace from all string fields
				for (const key in product) {
					if (typeof product[key] === "string") {
						product[key] = product[key].trim();
					}
				}

				// Get or create the supplier for the product
				const supplier = await getOrCreateSupplier({
					supplier_email: product["Supplier Email"]?.trim(),
					supplier_name: product["Supplier Name"],
					supplier_phone_no: product["Supplier Phone Number"].toString(),
					companyId: company.id,
				});

				// Remove commas and spaces from the price and validate it
				const priceWithoutComma = String(product.Price).replace(
					/^[₦#]|,?\s*/g,
					""
				);

				const jsDate = excelDateToJSDate(product["Purchase Date"]);
				const purchaseDateFormat = formatDateToYYYYMMDD(jsDate);

				// If the price is invalid and the user is an admin, return an error
				if (!Number(priceWithoutComma) && user.role === "ADMIN") {
					return res
						.status(StatusCodes.BAD_REQUEST)
						.json({ msg: "Invalid price" });
				}

				// Create the product and associate it with the connected supplier
				const result = await prisma.products.create({
					data: {
						product_name: product["Product Name"],
						brand: product.Brand || "Unknown", // Default if missing
						description: product.Description || "No description provided", // Default
						type: product["Item Type"] || "Miscellaneous", // Default
						price: user?.role === "ADMIN" ? priceWithoutComma : "0", // Set to "0" if not admin
						serial_no: product["Serial Number"].toString(),
						status: product["Status"].toUpperCase() || "AVAILABLE", // Default to "AVAILABLE"
						Company: {
							connect: { id: company.id },
						},
						AddedByUser: {
							connect: { id: user.id },
						},
						Supplier: {
							connect: { id: supplier.id },
						},
						purchase_date: product["Purchase Date"]
							? new Date(purchaseDateFormat)
							: null, // Default to current date if not provided
					},
				});

				results.push(result); // Collect successful results
			} catch (error) {
				console.error(error); // Log errors for debugging

				// Collect error details for failed product creation
				errors.push({
					product: product?.["Serial Number"] || "Unknown",
					error: `Error creating product with serial number ${product?.["Serial Number"]}: ${error.message}`,
				});
			}
		}

		// If there were any errors during processing, return them
		if (errors.length > 0) {
			const serialNo = errors.map(error => error.product);
			const errorMsg =
				serialNo.length > 5
					? "Some of the products already exist."
					: `Products with serial numbers ${serialNo.join(
							", "
					  )} already exist.`;
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: errorMsg });
		}

		// Return a success response with the created products
		res.status(StatusCodes.OK).json({ msg: "Products created!", results });
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
				AddedByUser: {
					select: {
						first_name: true,
						last_name: true,
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
		const { serialNo } = req.params;
		const { company_id } = req.user;

		const product = await prisma.products.findFirst({
			where: { serial_no: serialNo, sales_status: "NOT_SOLD" },
		});

		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Product not found", success: false });
		}

		const { description, price } = req.body;
		const priceWithoutComma = String(price).replace(/^[₦#]|,?\s*/g, "");
		if (!Number(priceWithoutComma)) {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid price" });
		}

		const updatedProduct = await prisma.products.update({
			where: {
				serial_no_companyId: {
					companyId: company_id,
					serial_no: serialNo,
				},
			},
			data: { description, price: priceWithoutComma },
		});

		res.status(StatusCodes.OK).json({ msg: "updateProduct", updatedProduct });
	},
	sellSingleProduct: async (req, res) => {
		const {
			serialNo,
			amount_paid,
			buyer_name,
			buyer_email,
			buyer_phone_no,
			balance_owed,
			modeOfPayment,
		} = req.body;
		const { company_id, email } = req.user;
		// return res.status(200).json({ ...req.body });

		const user = await prisma.users.findUnique({ where: { email } });
		if (!user) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ msg: "User not found." });
		}

		const retrievedProduct = await prisma.products.findFirst({
			where: {
				serial_no: serialNo,
				companyId: company_id,
				sales_status: "NOT_SOLD",
			},
		});

		if (!retrievedProduct) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Product not found or already sold." });
		}

		// Generate invoice number
		const company = await prisma.company.findUnique({
			where: { id: company_id },
		});
		if (!company) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Company not found." });
		}

		const invoiceNumber = await generateInvoiceNo(
			company.company_name,
			company_id
		);

		// Update product
		const updateData = {
			sales_status: "SOLD",
			SoldByUser: { connect: { id: user.id } },
			date_sold: new Date(),
			bought_for: amount_paid || product.price,
			balance_owed: balance_owed || "0",
			modeOfPay: modeOfPayment,
		};

		if (balance_owed !== "0") {
			await prisma.subPaymentDate.create({
				data: {
					date: new Date(),
					productId: retrievedProduct.id,
					Creditor: {
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
					},
				},
			});

			updateData["Creditor"] = {
				connect: {
					creditor_email_creditor_name_companyId: {
						creditor_name: buyer_name,
						creditor_email: buyer_email,
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
			where: { id: retrievedProduct.id },
			data: updateData,
		});

		const baseInvoiceData = {
			company: { connect: { id: company_id } },
			invoiceNo: invoiceNumber,
			product: { connect: { id: retrievedProduct.id } },
			status: balance_owed === "0" ? "OUTSTANDING" : "PAID",
			balance_due: balance_owed ? String(balance_owed) : "0",
		};

		if (balance_owed !== "0") {
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

		// Send invoice
		if (buyer_email) {
			await sendNodeInvoice(createdInvoice.invoiceNo);
		}

		return res.status(StatusCodes.OK).json({ msg: "Product sale completed." });
	},
	sellProductsBulk: async (req, res) => {
		let {
			products,
			buyer_name,
			buyer_email,
			buyer_phone_no,
			balance_owed,
			modeOfPayment,
		} = req.body;
		const { company_id, email } = req.user;

		const user = await prisma.users.findUnique({ where: { email } });
		if (!user) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ msg: "User not found." });
		}

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
		if (!company) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Company not found." });
		}

		const invoiceNumber = await generateInvoiceNo(
			company.company_name,
			company_id
		);

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
				modeOfPay: modeOfPayment,
				Customer: {
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
				},
			};

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
			customer: {
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
			},
		};

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

		// Step 4: Send invoice to the buyer
		if (buyer_email) {
			await sendNodeInvoice(createdInvoice.invoiceNo);
		}

		if (results.failed.length > 0) {
			const serialNo = results.failed.map(product => product.serialNo);
			const errorMsg =
				serialNo.length > 5
					? "Some of the products does not exist or already sold."
					: `Products with serial numbers ${serialNo.join(
							", "
					  )} does not exist or already sold.`;
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: errorMsg });
		}

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
			body: { outgoing, customerInfo, incoming, modeOfPayment },
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

		// Parse customerInfo.amount_paid
		const customerPaid = parseFloat(customerInfo.amount_paid || "0");

		// Calculate the total price
		const totalIncomingPrice = incoming.reduce(
			(sum, product) => sum + parseFloat(product.price || "0"),
			0
		);

		// Add customerPaid to totalIncomingPrice
		const finalTotal = (totalIncomingPrice + customerPaid).toFixed(2);

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
			purchase_date: new Date(),
			status: product.status.toUpperCase(),
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
				bought_for: finalTotal,
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
				modeOfPay: modeOfPayment,
			},
		});

		// Generate invoice for the swap transaction
		const prevInvoice = await prisma.invoice.findMany({
			where: { companyId: company.id },
			orderBy: { invoiceNo: "desc" },
			take: 1,
		});
		const invoiceNumber = generateInvoice(prevInvoice[0]?.invoiceNo);
		const createdInvoice = await prisma.invoice.create({
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

		// Send Invoice
		await sendNodeInvoice(createdInvoice.invoiceNo);

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
	getMonthlySalesAndPurchases: async (req, res) => {
		const { company_id } = req.user;
		const { barYear } = req.query;

		const selectedYear = barYear ? Number(barYear) : new Date().getFullYear();
		// Fetch sold products grouped by month
		const soldProducts = await prisma.products.findMany({
			where: {
				companyId: company_id,
				sales_status: { not: "NOT_SOLD" },
				date_sold: {
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
				createdAt: true,
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
			include: { Creditor: true },
		});

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

		// Update product balance and subPayDates
		const updatedData = {
			balance_owed: String(balance),
			date_sold: product.date_sold,
			bought_for: String(Number(amount) + Number(product.bought_for)),
		};

		// Update the product
		const updatedProduct = await prisma.products.update({
			where: { id: product.id },
			data: updatedData,
		});

		await prisma.subPaymentDate.create({
			data: {
				date: new Date(),
				productId: product.id,
				Creditor: {
					connect: {
						creditor_email_creditor_name_companyId: {
							creditor_email: product.Creditor.creditor_email,
							creditor_name: product.Creditor.creditor_name,
							companyId: product.companyId,
						},
					},
				},
			},
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

		const creditor = await prisma.creditor.findUnique({
			where: { id: product.Creditor.id },
		});

		if (creditor.creditor_email) {
			await sendNodeInvoice(invoice.invoiceNo);
		}

		// Return success message
		return res
			.status(StatusCodes.OK)
			.json({ msg: "Product sold successfully", success: true });
	},
	getTopSeller: async (req, res) => {
		const companyId = req.user.company_id;
		const { sellerMonth, sellerYear } = req.query;
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;

		const topSellerFilter = {
			year: sellerYear || currentYear,
			month: sellerMonth || currentMonth,
		};

		const topSoldProductAndUser = await prisma.products.groupBy({
			by: ["sold_by"],
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				date_sold: getDateRange(topSellerFilter.year, topSellerFilter.month),
			},
			_count: { sold_by: true },
		});

		const topSellerUserId = topSoldProductAndUser.length
			? topSoldProductAndUser.reduce((prev, current) =>
					prev._count.sold_by > current._count.sold_by ? prev : current
			  )
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
					date_sold: getDateRange(topSellerFilter.year, topSellerFilter.month),
				},
				select: { bought_for: true },
			}));

		const topSellerPrice = topSellerProducts
			? topSellerProducts.reduce(
					(sum, product) => sum + (parseFloat(product.bought_for) || 0),
					0
			  )
			: 0;

		return res.status(StatusCodes.OK).json({
			topSellerDetail: {
				first_name: topSeller ? topSeller.first_name : "",
				last_name: topSeller ? topSeller.last_name : "",
				count: topSellerUserId ? topSellerUserId._count.sold_by : 0,
				totalPrice: topSellerPrice || 0,
			},
		});
	},
	getBusSummaryNLss: async (req, res) => {
		const companyId = req.user.company_id;

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
		const creditorCount = await prisma.creditor.count({ where: { companyId } });

		const productCounts = unsoldProducts.reduce((acc, product) => {
			acc[product.product_name] = (acc[product.product_name] || 0) + 1;
			return acc;
		}, {});

		const lowQuantityProducts = Object.entries(productCounts)
			.filter(([_, count]) => count < 5)
			.sort((a, b) => a[1] - b[1])
			.slice(0, 5)
			.map(([product_name, count]) => ({ product_name, count }));

		return res.status(StatusCodes.OK).json({
			businessSummary: {
				stockCount,
				totalUnsoldPrice,
				suppliers: suppliersCount,
				customers: customersCount,
				creditors: creditorCount,
			},
			lowQuantityProducts,
		});
	},
	getTotalSalesNPurchase: async (req, res) => {
		const companyId = req.user.company_id;
		const { soldYear, soldMonth } = req.query;
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;

		const soldFilter = {
			// Get the year and month from the query string or use the current
			// year and month if not provided.
			year: soldYear || currentYear,
			month: soldMonth || currentMonth,
		};

		const soldProducts = await prisma.products.findMany({
			// Get products that were sold in the selected month and year.
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				// Exclude products that are not sold.
				date_sold: getDateRange(soldFilter.year, soldFilter.month),
				// Filter by the selected month and year.
			},
			select: { bought_for: true },
			// Only retrieve the bought_for field.
		});

		const totalSoldPrice = soldProducts.reduce(
			// Calculate the total price of all sold products.
			(sum, product) => sum + (parseFloat(product.bought_for) || 0),
			// Sum up all the prices.
			0
		);

		const totalSalesCount = await prisma.products.count({
			// Get the count of all products sold in the selected month and year.
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				// Exclude products that are not sold.
				date_sold: getDateRange(soldFilter.year, soldFilter.month),
				// Filter by the selected month and year.
			},
		});

		// Get total purchases and purchase price
		// Get all products purchased in the selected month and year.
		const allProductsPrice = await prisma.products.findMany({
			where: {
				companyId,
				createdAt: getDateRange(soldFilter.year, soldFilter.month),
				// Filter by the selected month and year.
			},
			select: { price: true },
			// Only retrieve the price field.
		});

		const totalPurchasePrice = allProductsPrice.reduce(
			// Calculate the total price of all purchased products.
			(sum, product) => sum + (parseFloat(product.price) || 0),
			// Sum up all the prices.
			0
		);
		const totalPurchasesCount = allProductsPrice.length;

		return res.status(StatusCodes.OK).json({
			totalSoldPrice,
			totalSalesCount,
			totalPurchasesCount,
			totalPurchasePrice,
		});
	},
	getTopSellingStocks: async (req, res) => {
		const companyId = req.user.company_id;
		const { tssMonth, tssYear } = req.query;
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;

		const tssFilter = {
			year: tssYear || currentYear,
			month: tssMonth || currentMonth,
		};

		const topSellingProducts = await prisma.products.groupBy({
			by: ["product_name"],
			where: {
				companyId,
				sales_status: { not: "NOT_SOLD" },
				date_sold: getDateRange(tssFilter.year, tssFilter.month),
			},
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

		return res.status(StatusCodes.OK).json({ topSellingWithDetails });
	},
	deleteProduct: async (req, res) => {
		const { serialNo } = req.params;
		const { company_id } = req.user;

		const product = await prisma.products.findUnique({
			where: {
				serial_no_companyId: { serial_no: serialNo, companyId: company_id },
			},
		});

		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "Product not found", success: false });
		}

		const deletedProduct = await prisma.products.delete({
			where: {
				serial_no_companyId: { serial_no: serialNo, companyId: company_id },
				sales_status: "NOT_SOLD",
			},
		});

		if (!deletedProduct) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Cannot delete product.", success: false });
		}

		return res
			.status(StatusCodes.OK)
			.json({ msg: "Product deleted", success: true });
	},
};
