import { Router } from "express";
import { InventoryCtrl } from "../controllers/inventory.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";
import { checkSubscriptionStatus } from "../middlewares/checkSubscriptionStatus.mjs";
import { customRateLimiter } from "../utils/customRateLimiter.mjs";

const router = Router();
const inventoryRateLimiter = customRateLimiter(60 * 1000, 20); // 1 minute, max 20 requests
const inventoryChangeRateLimiter = customRateLimiter(60 * 1000, 10); // 1 minute, max 10 requests

router
	.route("/createProduct")
	.post(
		[AuthMiddleware, checkSubscriptionStatus, inventoryChangeRateLimiter],
		InventoryCtrl.createProduct
	);
router
	.route("/createProducts")
	.post(
		[AuthMiddleware, checkSubscriptionStatus, inventoryChangeRateLimiter],
		InventoryCtrl.createProducts
	);

router
	.route("/getProducts/:type/:brand")
	.get([AuthMiddleware, inventoryRateLimiter], InventoryCtrl.getProducts);
router
	.route("/getAllProducts")
	.get(
		[AuthMiddleware, inventoryRateLimiter],
		InventoryCtrl.getAllProductNotSold
	);
router
	.route("/getProductsByStock")
	.get([AuthMiddleware], InventoryCtrl.getProductWithCount);
router
	.route("/getProduct/:serialNo")
	.get([AuthMiddleware, inventoryRateLimiter], InventoryCtrl.getProduct);
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
	.get(
		[AuthMiddleware, inventoryRateLimiter],
		InventoryCtrl.getSoldProductsByName
	);
router
	.route("/getSwapProductsByCount")
	.get([AuthMiddleware], InventoryCtrl.getCountOfSwapProducts);
router
	.route("/getSwapProducts/:type/:brand")
	.get(
		[AuthMiddleware, inventoryRateLimiter],
		InventoryCtrl.getSwapProductsByName
	);
router
	.route("/getBarChartData")
	.get([AuthMiddleware], InventoryCtrl.getMonthlySalesAndPurchases);

router
	.route("/updateProduct/:serialNo")
	.patch(
		[
			AuthMiddleware,
			AdminMiddleware,
			checkSubscriptionStatus,
			inventoryChangeRateLimiter,
		],
		InventoryCtrl.updateProduct
	);
router
	.route("/updateBalance/:id")
	.patch(
		[AuthMiddleware, checkSubscriptionStatus, inventoryChangeRateLimiter],
		InventoryCtrl.updateSoldProduct
	);
router
	.route("/sellProduct")
	.patch(
		[AuthMiddleware, checkSubscriptionStatus, inventoryChangeRateLimiter],
		InventoryCtrl.sellProductsBulk
	);

router
	.route("/swapProducts")
	.patch(
		[AuthMiddleware, checkSubscriptionStatus, inventoryChangeRateLimiter],
		InventoryCtrl.swapProducts
	);

router
	.route("/deleteProduct/:serialNo")
	.delete([AuthMiddleware, AdminMiddleware], InventoryCtrl.deleteProduct);

export default router;
