import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { sessionRouter } from "./session.router";

export const sessionApp = Router({ mergeParams: true });
sessionApp.use(authMiddleware);
sessionApp.use(sessionRouter);
