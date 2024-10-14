import { Router } from "express";
import { WebhookController } from "../controllers/webhook.c.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";

const router = Router();

router.post("/webhook", AuthMiddleware, WebhookController.webhook);

export default router;
