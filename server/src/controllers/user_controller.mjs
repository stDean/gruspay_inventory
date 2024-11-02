import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";
import { hashPassword } from "../utils/helper.mjs";

export const UserCtrl = {
	getUser: async (req, res) => {
		const { user } = req;
		const userInDb = await prisma.users.findUnique({
			where: { email: user.email },
			include: {
				Company: {
					select: {
						company_name: true,
						billingType: true,
						billingPlan: true,
						expires: true,
						cancelable: true,
						paymentStatus: true,
						canUpdate: true,
					},
				},
			},
		});

		if (!userInDb) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No user with that email" });
		}

		return res.status(StatusCodes.OK).json({ userInDb });
	},
	getUsers: async (req, res) => {
		const { user } = req;
		const users = await prisma.users.findMany({
			where: { companyId: user.company_id },
		});

		return res.status(StatusCodes.OK).json({ users });
	},
	updateUser: async (req, res) => {
		const { user } = req;
		const userInDb = await prisma.users.findUnique({
			where: { email: user.email },
		});

		if (!userInDb) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No user with that email" });
		}

		if (req.body.password !== "") {
			req.body.password = await hashPassword(req.body.password);
		} else {
			delete req.body.password;
		}

		const updatedUser = await prisma.users.update({
			where: { email: userInDb.email },
			data: { ...req.body },
		});

		return res
			.status(StatusCodes.OK)
			.json({ msg: "profile updated successful", updatedUser });
	},
	createUser: async (req, res) => {
		const existingUser = await prisma.users.findUnique({
			where: { companyId: req.user.company_id, email: req.body.email },
		});
		if (existingUser) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "User with this email already exists." });
		}

		// TODO:Not more than 2 admin for enterprise, and 1 admin for team and just admin in personal
		const hashPass = await hashPassword(req.body.password);
		await prisma.users.create({
			data: { ...req.body, password: hashPass, companyId: req.user.company_id },
		});

		return res
			.status(StatusCodes.OK)
			.json({ msg: "User created successfully" });
	},
	updateUserRole: async (req, res) => {
		const { id } = req.params;

		const existingUser = await prisma.users.findUnique({ where: { id } });
		if (!existingUser) {
			return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
		}

		await prisma.users.update({
			where: { id },
			data: { role: req.body.role },
		});

		return res
			.status(StatusCodes.OK)
			.json({ msg: "User role updated successfully" });
	},
	getUserById: async (req, res) => {
		const { id } = req.params;
		const user = await prisma.users.findUnique({
			where: { id },
		});

		if (!user) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No user with that id" });
		}
		return res.status(StatusCodes.OK).json({ user });
	},
	getCustomers: async (req, res) => {
		const { user } = req;
		const customers = await prisma.buyer.findMany({
			where: { companyId: user.company_id },
			include: { Products: { where: { balance_owed: "0" } } },
		});

		return res.status(StatusCodes.OK).json({ customers });
	},
	getCustomer: async (req, res) => {
		const customer = await prisma.buyer.findUnique({
			where: {
				id: req.params.id,
				companyId: req.user.company_id,
			},
			include: { Products: true },
		});

		if (!customer) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No customer with that id" });
		}

		return res.status(StatusCodes.OK).json({ customer });
	},
	getCreditors: async (req, res) => {
		const { user } = req;
		const creditors = await prisma.creditor.findMany({
			where: { companyId: user.company_id },
			include: { Products: true },
		});

		return res.status(StatusCodes.OK).json({ creditors });
	},
	getCreditor: async (req, res) => {
		const creditor = await prisma.creditor.findUnique({
			where: {
				id: req.params.id,
				companyId: req.user.company_id,
			},
			include: {
				Products: {
					select: {
						product_name: true,
						serial_no: true,
						price: true,
						bought_for: true,
						balance_owed: true,
						date_sold: true,
						Creditor: true,
						id: true,
						date_sold: true,
						invoiceId: true,
					},
				},
			},
		});

		if (!creditor) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No creditor with that id" });
		}

		return res.status(StatusCodes.OK).json({ creditor });
	},
	getSuppliers: async (req, res) => {
		const suppliers = await prisma.supplier.findMany({
			where: { companyId: req.user.company_id },
			include: { Products: true },
		});

		return res.status(StatusCodes.OK).json({ suppliers });
	},
	getSupplier: async (req, res) => {
		const supplier = await prisma.supplier.findUnique({
			where: { id: req.params.id, companyId: req.user.company_id },
			include: { Products: true },
		});

		if (!supplier) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No supplier with that id" });
		}

		return res.status(StatusCodes.OK).json({ supplier });
	},
	deleteUser: async (req, res) => {
		// delete a user that is not yourself
		const {
			user: { email, company_id },
			params: { id },
		} = req;

		const user = await prisma.users.findUnique({ where: { email } });
		if (user.id === id) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Cannot perform this action" });
		}

		const deletedUser = await prisma.users.delete({
			where: { id: req.params.id, companyId: company_id },
		});

		if (!deletedUser) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ msg: "No user with that id" });
		}

		return res
			.status(StatusCodes.OK)
			.json({ msg: "User deleted successfully" });
	},
};
