import { Router } from "express";
import { AuthController } from "../controllers/auth_controller.mjs";

const router = Router();

router.post("/auth/sendOTP", AuthController.sendOtp);
router.post("/auth/verifyOTP", AuthController.verifyOtp);
router.post("/auth/resendOTP", AuthController.resendOtp);
router.post("/auth/login", AuthController.login);
router.post("/auth/resetOtp", AuthController.otp);
router.post("/auth/updatePassword", AuthController.verifyAndUpdatePassword);

export default router;
