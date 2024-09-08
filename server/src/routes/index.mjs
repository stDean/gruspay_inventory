import { Router } from "express";
import AuthRouter from "./auth.r.mjs";

const router = Router();

router.use(AuthRouter);

export default router;
