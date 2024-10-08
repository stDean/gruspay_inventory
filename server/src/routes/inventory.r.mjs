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
	.route("/getAllProducts")
	.get(AuthMiddleware, InventoryCtrl.getAllProductNotSold);
router
	.route("/getProductsByStock")
	.get(AuthMiddleware, InventoryCtrl.getProductWithCount);
router
	.route("/getProduct/:serialNo")
	.get(AuthMiddleware, InventoryCtrl.getProduct);
router
	.route("/getInventoryStats")
	.get(AuthMiddleware, InventoryCtrl.getInventoryStats);

router
	.route("/getSoldProductsByCount")
	.get(AuthMiddleware, InventoryCtrl.getCountOfSoldProducts);
router
	.route("/getSoldProducts/:product_name")
	.get(AuthMiddleware, InventoryCtrl.getSoldProductsByName);

router
	.route("/getSwapProductsByCount")
	.get(AuthMiddleware, InventoryCtrl.getCountOfSwapProducts);
router
	.route("/getSwapProducts/:product_name")
	.get(AuthMiddleware, InventoryCtrl.getSwapProductsByName);

router
	.route("/updateProduct/:id")
	.patch([AuthMiddleware, AdminMiddleware], InventoryCtrl.updateProduct);
router
	.route("/sellProduct/:serialNo")
	.patch(AuthMiddleware, InventoryCtrl.sellProduct);

router.route("/swapProducts").patch(AuthMiddleware, InventoryCtrl.swapProducts);

export default router;
