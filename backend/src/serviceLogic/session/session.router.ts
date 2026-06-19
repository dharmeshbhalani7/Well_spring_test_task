import { Router } from "express";
import * as sessionController from "./controllers/sessionController";

export const sessionRouter = Router({ mergeParams: true });

sessionRouter.get("/", sessionController.listSessionsController);
sessionRouter.post("/", sessionController.createSessionController);
sessionRouter.put("/reorder", sessionController.reorderSessionsController);
sessionRouter.get("/:sessionId", sessionController.getSessionController);
sessionRouter.patch("/:sessionId", sessionController.updateSessionController);
sessionRouter.delete("/:sessionId", sessionController.deleteSessionController);
