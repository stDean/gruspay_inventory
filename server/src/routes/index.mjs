import { Router } from "express";
import AuthRouter from "./auth.r.mjs";
import InventoryRouter from "./inventory.r.mjs";
import UserRouter from "./user.r.mjs";
import InvoiceRouter from "./invoice.r.mjs";
import PayStackRouter from "./paystackwebhook.mjs";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/inventory", InventoryRouter);
router.use("/user", UserRouter);
router.use("/invoice", InvoiceRouter);
router.use("/paystack", PayStackRouter);

export default router;
