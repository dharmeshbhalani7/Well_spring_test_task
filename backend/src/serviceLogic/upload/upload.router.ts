import { Router } from "express";
import * as signController from "./controllers/presignController";

export const uploadRouter = Router();

uploadRouter.post("/presign", signController.presignController);
