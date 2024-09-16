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
				serialNo,
				supplier_name,
				supplierPhoneNo,
				suppliersEmail,
			},
		} = req;

		const product = await prisma.products.findUnique({
			where: { serialNo },
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
				serialNo,
				companyId: company.id,
				added_by: user.id,
				supplier_name,
				supplierPhoneNo,
			},
		});

		const supplier = await prisma.supplier.findUnique({
			where: { name: supplier_name },
		});
		if (!supplier) {
			await prisma.supplier.create({
				data: {
					name: supplier_name,
					phoneNo: supplierPhoneNo,
					email: suppliersEmail || "",
					companyId: company.id,
				},
			});
		}

		res.status(StatusCodes.OK).json({ msg: "createProduct" });
	},
	createProducts: async (req, res) => {
		const {
			user: { company_id, email },
		} = req;
		const { company, user: userData } = await useUserAndCompany({
			company_id,
			email,
		});
		const productData = req.body.map(product => ({
			...product,
			companyId: company.id,
			added_by: userData.id,
		}));
		const supplierData = req.body.map(supplier => ({
			name: supplier.supplier_name,
			email: supplier.suppliersEmail,
			phoneNo: supplier.supplierPhoneNo,
			companyId: company.id,
		}));
		const addMany = await prisma.products.createMany({
			data: productData,
			skipDuplicates: true,
		});

		await prisma.supplier.createMany({
			data: supplierData,
			skipDuplicates: true,
		});

		if (addMany.count === 0)
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Product already exists" });

		res.status(StatusCodes.OK).json({ msg: "createManyProducts", addMany });
	},
	getProducts: async (req, res) => {
		const { product_name } = req.params;
		const products = await prisma.products.findMany({
			where: { companyId: req.user.company_id, product_name },
		});

		res.status(StatusCodes.OK).json(products);
	},
	getProductWithCount: async (req, res) => {
		const productsByCount = await prisma.products.groupBy({
			where: { companyId: req.user.company_id },
			by: ["type", "brand", "product_name"],
			_count: {
				type: true,
			},
		});
		return res.status(StatusCodes.OK).json(productsByCount);
	},
	getProduct: async (req, res) => {
		const { id, serialNo } = req.params;

		const product = await prisma.products.findUnique({
			where: { id, serialNo },
			include: { User: true },
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

		const product = await prisma.products.findUnique({
			where: { id },
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
};
