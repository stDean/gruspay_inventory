import { Router } from "express";
import { AuthController } from "../controllers/auth_controller.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionStatus.mjs";

const router = Router();

router.post("/createCompany", AuthController.createCompany);
router.post("/verifyOTP", AuthController.verifyOtp);
router.post("/resendOTP", AuthController.resendOtp);
router.post("/login", AuthController.login);
router.post("/resetOtp", AuthController.otp);
router.post("/updatePassword", AuthController.verifyAndUpdatePassword);
router.post("/updatePassword", AuthController.verifyAndUpdatePassword);
router.post(
	"/updateSubscription",
	[AuthMiddleware, AdminMiddleware, checkSubscriptionStatus],
	AuthController.updateSubscription
);
router.post(
	"/cancelSubscription",
	[AuthMiddleware, AdminMiddleware, checkSubscriptionStatus],
	AuthController.cancelSubscription
);

export default router;
