import { Router } from "express";
import { AuthController } from "../controllers/auth_controller.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";

const router = Router();

router.post("/createCompany", AuthController.createCompany);
router.post("/verifyOTP", AuthController.verifyOtp);
router.post("/resendOTP", AuthController.resendOtp);
router.post("/login", AuthController.login);
router.post("/resetOtp", AuthController.otp);
router.post("/updatePassword", AuthController.verifyAndUpdatePassword);

export default router;
