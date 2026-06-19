import { Router } from "express";
import { auditRouter } from "./audit.router";
import { authMiddleware } from "../../middleware/auth";

export const auditApp = Router();
auditApp.use(authMiddleware);
auditApp.use(auditRouter);
