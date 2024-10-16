import { Router } from "express";
import { AuthController } from "../controllers/auth_controller.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionStatus.mjs";
import { customRateLimiter } from "../utils/customRateLimiter.mjs";

const router = Router();
const authRateLimiter = customRateLimiter(15 * 60 * 1000, 5); // 15 minutes, max 5 requests

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
// const updateOrCancelRateLimiter = customRateLimiter(
// 	THIRTY_DAYS_IN_MS,
// 	1,
// 	"This action is limited to once every 30 days. Try again later."
// );

router.post("/createCompany", authRateLimiter, AuthController.createCompany);
router.post("/verifyOTP", authRateLimiter, AuthController.verifyOtp);
router.post("/resendOTP", authRateLimiter, AuthController.resendOtp);
router.post("/login", authRateLimiter, AuthController.login);
router.post("/resetOtp", authRateLimiter, AuthController.otp);
router.post(
	"/updatePassword",
	authRateLimiter,
	AuthController.verifyAndUpdatePassword
);
router.post(
	"/updatePassword",
	authRateLimiter,
	AuthController.verifyAndUpdatePassword
);
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
