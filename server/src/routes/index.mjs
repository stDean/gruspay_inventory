import { Router } from "express";
import AuthRouter from "./auth.r.mjs";
import InventoryRouter from "./inventory.r.mjs";
import UserRouter from "./user.r.mjs";
import WebhookRouter from "./webhook.r.mjs";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/inventory", InventoryRouter);
router.use("/user", UserRouter);
router.use("/paystack", WebhookRouter);

export default router;
