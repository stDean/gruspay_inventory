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
	.route("/getProducts/:type/:brand")
	.get([AuthMiddleware], InventoryCtrl.getProducts);
router
	.route("/getAllProducts")
	.get([AuthMiddleware], InventoryCtrl.getAllProductNotSold);
router
	.route("/getProductsByStock")
	.get([AuthMiddleware], InventoryCtrl.getProductWithCount);
router
	.route("/getProduct/:serialNo")
	.get([AuthMiddleware], InventoryCtrl.getProduct);
router
	.route("/getInventoryStats")
	.get([AuthMiddleware], InventoryCtrl.getInventoryStats);

router
	.route("/getTopSeller")
	.get([AuthMiddleware, AdminMiddleware], InventoryCtrl.getTopSeller);
router
	.route("/getBusSummaryNLss")
	.get([AuthMiddleware, AdminMiddleware], InventoryCtrl.getBusSummaryNLss);
router
	.route("/getTotalSalesNPurchase")
	.get([AuthMiddleware, AdminMiddleware], InventoryCtrl.getTotalSalesNPurchase);
router
	.route("/getTopSellingStocks")
	.get([AuthMiddleware, AdminMiddleware], InventoryCtrl.getTopSellingStocks);
router
	.route("/getSoldProductsByCount")
	.get([AuthMiddleware], InventoryCtrl.getCountOfSoldProducts);
router
	.route("/getSoldProducts/:type/:brand")
	.get([AuthMiddleware], InventoryCtrl.getSoldProductsByName);
router
	.route("/getSwapProductsByCount")
	.get([AuthMiddleware], InventoryCtrl.getCountOfSwapProducts);
router
	.route("/getSwapProducts/:type/:brand")
	.get([AuthMiddleware], InventoryCtrl.getSwapProductsByName);
router
	.route("/getBarChartData")
	.get([AuthMiddleware], InventoryCtrl.getMonthlySalesAndPurchases);

router
	.route("/updateProduct/:serialNo")
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
	.route("/sellSingleProduct")
	.patch(
		[AuthMiddleware, checkSubscriptionStatus],
		InventoryCtrl.sellSingleProduct
	);
router
	.route("/sellProduct")
	.patch(
		[AuthMiddleware, checkSubscriptionStatus],
		InventoryCtrl.sellProductsBulk
	);

router
	.route("/updateBoughtPrice/:serialNo")
	.patch(
		[AuthMiddleware, AdminMiddleware, checkSubscriptionStatus],
		InventoryCtrl.updateBoughtPrice
	);

router
	.route("/swapProducts")
	.patch([AuthMiddleware, checkSubscriptionStatus], InventoryCtrl.swapProducts);

router
	.route("/deleteProduct/:serialNo")
	.delete([AuthMiddleware, AdminMiddleware, checkSubscriptionStatus], InventoryCtrl.deleteProduct);

export default router;
