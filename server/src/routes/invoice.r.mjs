import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionStatus.mjs";
import { customRateLimiter } from "../utils/customRateLimiter.mjs";
import { InvoiceCtrl } from "../controllers/invoice.c.mjs";

const router = Router();
const invoiceRateLimiter = customRateLimiter(15 * 60 * 1000, 5); // 15 minutes, max 5 requests

router
	.route("/all")
	.get([AuthMiddleware], InvoiceCtrl.getAllInvoices);
router
	.route("/:invoiceNo")
	.get([AuthMiddleware], InvoiceCtrl.getInvoice);
router
	.route("/resend/:invoiceNo")
	.post(
		[AuthMiddleware, checkSubscriptionStatus, invoiceRateLimiter],
		InvoiceCtrl.resendInvoice
	);

export default router;
