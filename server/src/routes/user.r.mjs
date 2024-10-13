import { Router } from "express";
import { UserCtrl } from "../controllers/user_controller.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";
import {
	AddUserMiddleware,
	CustomerAndCreditorMiddleware,
	SupplierMiddleware,
} from "../middlewares/plans.m.mjs";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionStatus.mjs";

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
		[AuthMiddleware, SupplierMiddleware, checkSubscriptionStatus],
		UserCtrl.getSuppliers
	);
router
	.route("/getSupplier/:id")
	.get(
		[AuthMiddleware, SupplierMiddleware, checkSubscriptionStatus],
		UserCtrl.getSupplier
	);
router
	.route("/getCustomers")
	.get(
		[AuthMiddleware, CustomerAndCreditorMiddleware, checkSubscriptionStatus],
		UserCtrl.getCustomers
	);
router
	.route("/getCustomer/:id")
	.get(
		[AuthMiddleware, CustomerAndCreditorMiddleware, checkSubscriptionStatus],
		UserCtrl.getCustomer
	);
router
	.route("/getCreditors")
	.get(
		[AuthMiddleware, CustomerAndCreditorMiddleware, checkSubscriptionStatus],
		UserCtrl.getCreditors
	);
router
	.route("/getCreditor/:id")
	.get(
		[AuthMiddleware, CustomerAndCreditorMiddleware, checkSubscriptionStatus],
		UserCtrl.getCreditor
	);

router
	.route("/updateUser")
	.patch([AuthMiddleware, checkSubscriptionStatus], UserCtrl.updateUser);
router
	.route("/updateUserRole/:id")
	.patch(
		[AuthMiddleware, AdminMiddleware, checkSubscriptionStatus],
		UserCtrl.updateUserRole
	);

router
	.route("/createUser")
	.post(
		[
			AuthMiddleware,
			AdminMiddleware,
			AddUserMiddleware,
			checkSubscriptionStatus,
		],
		UserCtrl.createUser
	);

export default router;
