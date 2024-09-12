import { Router } from "express";
import AuthRouter from "./auth.r.mjs";
import InventoryRouter from "./inventory.r.mjs";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/inventory", InventoryRouter);

export default router;
