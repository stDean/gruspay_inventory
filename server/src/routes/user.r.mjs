import { Router } from "express";
import { UserCtrl } from "../controllers/user_controller.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";
import {
	AddUserMiddleware,
	CustomerAndCreditorMiddleware,
	SupplierMiddleware,
} from "../middlewares/plans.m.mjs";

const router = Router();

router.route("/getUser").get(AuthMiddleware, UserCtrl.getUser);
router
	.route("/getUsers")
	.get([AuthMiddleware, AdminMiddleware], UserCtrl.getUsers);
router
	.route("/getUser/:id")
	.get([AuthMiddleware, AdminMiddleware], UserCtrl.getUserById);
router
	.route("/getSuppliers")
	.get(
		[AuthMiddleware, AdminMiddleware, SupplierMiddleware],
		UserCtrl.getSuppliers
	);
router
	.route("/getSupplier/:id")
	.get(
		[AuthMiddleware, AdminMiddleware, SupplierMiddleware],
		UserCtrl.getSupplier
	);
router
	.route("/getCustomers")
	.get(
		[AuthMiddleware, AdminMiddleware, CustomerAndCreditorMiddleware],
		UserCtrl.getCustomers
	);
router
	.route("/getCustomer/:id")
	.get(
		[AuthMiddleware, AdminMiddleware, CustomerAndCreditorMiddleware],
		UserCtrl.getCustomer
	);
router
	.route("/getCreditors")
	.get(
		[AuthMiddleware, AdminMiddleware, CustomerAndCreditorMiddleware],
		UserCtrl.getCreditors
	);
router
	.route("/getCreditor/:id")
	.get(
		[AuthMiddleware, AdminMiddleware, CustomerAndCreditorMiddleware],
		UserCtrl.getCreditor
	);

router.route("/updateUser").patch(AuthMiddleware, UserCtrl.updateUser);
router
	.route("/updateUserRole/:id")
	.patch(AuthMiddleware, UserCtrl.updateUserRole);
router
	.route("/updateCompanyPlan")
	.patch([AuthMiddleware, AdminMiddleware], UserCtrl.updateCompanyPlan);

router
	.route("/createUser")
	.post(
		[AuthMiddleware, AdminMiddleware, AddUserMiddleware],
		UserCtrl.createUser
	);

export default router;
