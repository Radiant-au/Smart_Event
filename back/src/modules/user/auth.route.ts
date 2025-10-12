import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticateUserToken } from "../../utils/middleware";

const router = Router();
const controller = new AuthController();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post(
  "/change-password",
  authenticateUserToken,
  controller.changePassword
);
router.post("/reset-password", authenticateUserToken, controller.resetPassword);
router.get("/me", authenticateUserToken, controller.getMe);

export default router;
