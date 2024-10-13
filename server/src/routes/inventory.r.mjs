import { Router } from "express";
import { InventoryCtrl } from "../controllers/inventory.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionStatus.mjs";

const router = Router();

router
	.route("/createProduct")
	.post([AuthMiddleware, checkSubscriptionStatus], InventoryCtrl.createProduct);
router
	.route("/createProducts")
	.post(
		[AuthMiddleware, checkSubscriptionStatus],
		InventoryCtrl.createProducts
	);

router
	.route("/getProducts/:type/:brand/:product_name")
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
	.route("/getDashboardStats")
	.get(AuthMiddleware, InventoryCtrl.getDashboardStats);
router
	.route("/getSoldProductsByCount")
	.get(AuthMiddleware, InventoryCtrl.getCountOfSoldProducts);
router
	.route("/getSoldProducts/:type/:brand/:product_name")
	.get(AuthMiddleware, InventoryCtrl.getSoldProductsByName);
router
	.route("/getSwapProductsByCount")
	.get(AuthMiddleware, InventoryCtrl.getCountOfSwapProducts);
router
	.route("/getSwapProducts/:type/:brand/:product_name")
	.get(AuthMiddleware, InventoryCtrl.getSwapProductsByName);
router
	.route("/getBarChartData")
	.get(AuthMiddleware, InventoryCtrl.getMonthlySalesAndPurchases);

router
	.route("/updateProduct/:id")
	.patch(
		[AuthMiddleware, AdminMiddleware, checkSubscriptionStatus],
		InventoryCtrl.updateProduct
	);
router
	.route("/updateBalance/:id")
	.patch(
		[AuthMiddleware, checkSubscriptionStatus],
		InventoryCtrl.updateSoldProduct
	);
router
	.route("/sellProduct/:serialNo")
	.patch([AuthMiddleware, checkSubscriptionStatus], InventoryCtrl.sellProduct);

router
	.route("/swapProducts")
	.patch([AuthMiddleware, checkSubscriptionStatus], InventoryCtrl.swapProducts);

export default router;
