import { Router } from "express";
import * as programController from "./controllers/programController";

export const programRouter = Router();

programRouter.get("/", programController.listProgramsController);
programRouter.post("/", programController.createProgramController);
programRouter.get("/:id", programController.getProgramController);
programRouter.patch("/:id", programController.updateProgramController);
programRouter.delete("/:id", programController.deleteProgramController);
