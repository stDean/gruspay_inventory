import { Router } from "express";
import { AuthController } from "../controllers/auth_controller.mjs";

const router = Router();

router.post("/auth/sendOTP", AuthController.sendOtp);
router.post("/auth/verifyOTP", AuthController.verifyOtp);
router.post("/auth/resendOTP", AuthController.resendOtp);

export default router;
