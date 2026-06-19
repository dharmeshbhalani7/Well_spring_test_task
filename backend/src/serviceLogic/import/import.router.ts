import { Router } from "express";
import { csvUpload } from "./import.helper";
import * as importController from "./controllers/bulkImportController";

export const importRouter = Router({ mergeParams: true });

importRouter.post(
  "/",
  csvUpload.single("file"),
  importController.bulkImportController,
);
