import { Router } from "express";
import * as auditLogsController from "./controllers/listAuditLogsController";

export const auditRouter = Router();

auditRouter.get("/", auditLogsController.listAuditLogsController);
