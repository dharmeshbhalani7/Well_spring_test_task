import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { importRouter } from "./import.router";

export const importApp = Router({ mergeParams: true });
importApp.use(authMiddleware);
importApp.use(importRouter);
