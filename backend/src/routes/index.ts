import { Router } from "express";
import { authApp } from "../serviceLogic/auth/auth.app";
import { programApp } from "../serviceLogic/program/program.app";
import { sessionApp } from "../serviceLogic/session/session.app";
import { importApp } from "../serviceLogic/import/import.app";
import { uploadApp } from "../serviceLogic/upload/upload.app";
import { auditApp } from "../serviceLogic/audit/audit.app";

export const apiRouter = Router();

apiRouter.use("/auth", authApp);
apiRouter.use("/programs", programApp);
apiRouter.use("/programs/:programId/sessions", sessionApp);
apiRouter.use("/programs/:programId/sessions/import", importApp);
apiRouter.use("/uploads", uploadApp);
apiRouter.use("/audit-logs", auditApp);
