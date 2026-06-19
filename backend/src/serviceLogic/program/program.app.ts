import { Router } from "express";
import { programRouter } from "./program.router";
import { authMiddleware } from "../../middleware/auth";

export const programApp = Router();
programApp.use(authMiddleware);
programApp.use(programRouter);
