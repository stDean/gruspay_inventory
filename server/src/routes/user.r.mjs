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
import { customRateLimiter } from "../utils/customRateLimiter.mjs";

const router = Router();

const userRateLimiter = customRateLimiter(60 * 1000, 10); // 1 minute, max 10 requests
const userChangeRateLimiter = customRateLimiter(5 * 60 * 1000, 5); // 5 minutes, max 5 requests

router.route("/getUser").get(AuthMiddleware, UserCtrl.getUser);
router
	.route("/getUsers")
	.get([AuthMiddleware, AdminMiddleware, userRateLimiter], UserCtrl.getUsers);
router
	.route("/getUser/:id")
	.get(
		[AuthMiddleware, AdminMiddleware, userRateLimiter],
		UserCtrl.getUserById
	);
router
	.route("/getSuppliers")
	.get(
		[
			AuthMiddleware,
			SupplierMiddleware,
			checkSubscriptionStatus,
			userRateLimiter,
		],
		UserCtrl.getSuppliers
	);
router
	.route("/getSupplier/:id")
	.get(
		[
			AuthMiddleware,
			AdminMiddleware,
			SupplierMiddleware,
			checkSubscriptionStatus,
			userRateLimiter,
		],
		UserCtrl.getSupplier
	);
router
	.route("/getCustomers")
	.get(
		[
			AuthMiddleware,
			CustomerAndCreditorMiddleware,
			checkSubscriptionStatus,
			userRateLimiter,
		],
		UserCtrl.getCustomers
	);
router
	.route("/getCustomer/:id")
	.get(
		[
			AuthMiddleware,
			AdminMiddleware,
			CustomerAndCreditorMiddleware,
			checkSubscriptionStatus,
			userRateLimiter,
		],
		UserCtrl.getCustomer
	);
router
	.route("/getCreditors")
	.get(
		[
			AuthMiddleware,
			AdminMiddleware,
			CustomerAndCreditorMiddleware,
			checkSubscriptionStatus,
			userRateLimiter,
		],
		UserCtrl.getCreditors
	);
router
	.route("/getCreditor/:id")
	.get(
		[
			AuthMiddleware,
			AdminMiddleware,
			CustomerAndCreditorMiddleware,
			checkSubscriptionStatus,
			userRateLimiter,
		],
		UserCtrl.getCreditor
	);

router
	.route("/updateUser")
	.patch(
		[
			AuthMiddleware,
			checkSubscriptionStatus,
			userChangeRateLimiter,
			userRateLimiter,
		],
		UserCtrl.updateUser
	);
router
	.route("/updateUserRole/:id")
	.patch(
		[
			AuthMiddleware,
			AdminMiddleware,
			checkSubscriptionStatus,
			userChangeRateLimiter,
		],
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
			userChangeRateLimiter,
		],
		UserCtrl.createUser
	);

router
	.route("/deleteUser/:id")
	.delete(
		[
			AuthMiddleware,
			AdminMiddleware,
			checkSubscriptionStatus,
			userChangeRateLimiter,
		],
		AuthMiddleware,
		UserCtrl.deleteUser
	);

export default router;
