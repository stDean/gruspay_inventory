import { Router } from "express";
import { InventoryCtrl } from "../controllers/inventory.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";

const router = Router();

router
	.route("/createProduct")
	.post(AuthMiddleware, InventoryCtrl.createProduct);
router.route("/getProducts").get(AuthMiddleware, InventoryCtrl.getProducts);
router.route("/getProduct/:id").get(AuthMiddleware, InventoryCtrl.getProduct);
router
	.route("/updateProduct/:id")
	.patch([AuthMiddleware, AdminMiddleware], InventoryCtrl.updateProduct);

export default router;
