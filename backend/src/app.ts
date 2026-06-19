import express from "express";
import cors from "cors";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLoggerMiddleware } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { healthController } from "./shared/health.controller";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  app.get("/health", healthController);
  app.use("/api/v1/admin", apiRouter);
  app.use(errorHandler);

  return app;
}
