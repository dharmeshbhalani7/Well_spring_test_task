import { Router } from "express";
import * as authController from "./controllers/authController";

export const authRouter = Router();

authRouter.post("/signup", authController.signupController);
authRouter.post("/login", authController.loginController);
authRouter.post(
  "/password-reset/request",
  authController.requestPasswordResetController,
);
authRouter.post(
  "/password-reset/confirm",
  authController.confirmPasswordResetController,
);
