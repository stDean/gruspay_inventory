import { Router } from "express";
import { PayStackController } from "../controllers/paystack.c.mjs";

const router = Router();

router.get("/getPayPlans", PayStackController.getPlans);
router.get("/getCustomer/:email", PayStackController.getCustomer);
router.get(
	"/getSubscriptions/:customer_id",
	PayStackController.getCustomerActiveSubscriptions
);
router.post(
	"/initializeSubscription",
	PayStackController.initializeTransaction
);
router.post("/createSubscription", PayStackController.createSubscription);

export default router;
