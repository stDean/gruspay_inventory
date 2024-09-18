import { Router } from "express";
import { InventoryCtrl } from "../controllers/inventory.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";

const router = Router();

router
	.route("/createProduct")
	.post(AuthMiddleware, InventoryCtrl.createProduct);
router
	.route("/createProducts")
	.post(AuthMiddleware, InventoryCtrl.createProducts);

router
	.route("/getProducts/:product_name")
	.get(AuthMiddleware, InventoryCtrl.getProducts);
router
	.route("/getProductsByStock")
	.get(AuthMiddleware, InventoryCtrl.getProductWithCount);
router
	.route("/getProduct/:serialNo")
	.get(AuthMiddleware, InventoryCtrl.getProduct);

router
	.route("/getSoldProductsByCount")
	.get(AuthMiddleware, InventoryCtrl.getCountOfSoldProducts);
router
	.route("/getSoldProducts/:product_name")
	.get(AuthMiddleware, InventoryCtrl.getSoldProductsByName);

router
	.route("/updateProduct/:id")
	.patch([AuthMiddleware, AdminMiddleware], InventoryCtrl.updateProduct);
router
	.route("/sellProduct/:serialNo")
	.patch(AuthMiddleware, InventoryCtrl.sellProduct);

export default router;
