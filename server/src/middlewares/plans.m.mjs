import { StatusCodes } from "http-status-codes";
import { prisma } from "../utils/db.mjs";

async function checkCompany(company_id) {
	const company = await prisma.company.findUnique({
		where: { id: company_id },
		include: {
			Users: true,
			Products: { where: { sales_status: "NOT_SOLD" } },
		},
	});

	if (!company) {
		return res
			.status(StatusCodes.NOT_FOUND)
			.json({ msg: "Company not found", success: false });
	}

	return company;
}

export const AddUserMiddleware = async (req, res, next) => {
	const { company_id } = req.user;
	const company = await checkCompany(company_id);

	switch (company.billingPlan) {
		case "PERSONAL":
			if (company.Users.length < 2) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					msg: "Update plan to perform this action",
				});
			}
		case "TEAM":
			if (company.Users.length < 5) {
				return next();
			} else {
				return res.status(StatusCodes.BAD_REQUEST).json({
					msg: "Update plan to perform this action",
				});
			}
		case "ENTERPRISE":
			if (company.Users.length < 10) {
				return next();
			} else {
				return res.status(StatusCodes.BAD_REQUEST).json({
					msg: "Update plan to perform this action",
				});
			}
		default:
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Update plan to perform this action" });
	}
};

export const SupplierMiddleware = async (req, res, next) => {
	const { company_id } = req.user;
	const company = await checkCompany(company_id);

	if (company.billingPlan === "PERSONAL") {
		return res.status(StatusCodes.BAD_REQUEST).json({
			msg: "Cannot perform this action",
		});
	}

	next();
};

export const CustomerAndCreditorMiddleware = async (req, res, next) => {
	const { company_id } = req.user;
	const company = await checkCompany(company_id);

	if (company.billingPlan === "PERSONAL" || company.billingPlan === "TEAM") {
		return res.status(StatusCodes.BAD_REQUEST).json({
			msg: "Cannot perform this action",
		});
	}

	next();
};
