import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { uploadRouter } from "./upload.router";

export const uploadApp = Router();
uploadApp.use(authMiddleware);
uploadApp.use(uploadRouter);
