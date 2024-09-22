import { Router } from "express";
import { UserCtrl } from "../controllers/user_controller.mjs";
import { AuthMiddleware } from "../middlewares/auth.m.mjs";
import { AdminMiddleware } from "../middlewares/admin.m.mjs";

const router = Router();

router.route("/getUser").get(AuthMiddleware, UserCtrl.getUser);
router
	.route("/getUsers")
	.get([AuthMiddleware, AdminMiddleware], UserCtrl.getUsers);

router.route("/updateUser").patch(AuthMiddleware, UserCtrl.updateUser);
router.route("/updateUserRole").patch(AuthMiddleware, UserCtrl.updateUser);

router.route("/createUser").post(AuthMiddleware, UserCtrl.createUser);

export default router;
