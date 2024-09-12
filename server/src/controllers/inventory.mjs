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
        supplierPhoneNo
			},
		});

		res.status(StatusCodes.OK).json({ msg: "createProduct" });
	},
	getProducts: async (req, res) => {
		const products = await prisma.products.findMany();
		res.status(StatusCodes.OK).json(products);
	},
	getProduct: async (req, res) => {
		const { id } = req.params;

		const product = await prisma.products.findUnique({
			where: { id },
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
