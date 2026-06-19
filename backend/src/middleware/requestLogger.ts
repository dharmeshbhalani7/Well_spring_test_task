import { Request, Response, NextFunction } from "express";
import { createRequestLogger } from "../shared/logger";

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  const log = createRequestLogger({
    request_id: req.requestId,
    tenant_id: req.tenantId,
    method: req.method,
    path: req.path,
  });

  res.on("finish", () => {
    log.info(
      {
        status_code: res.statusCode,
        duration_ms: Date.now() - start,
        tenant_id: req.tenantId ?? null,
      },
      "request completed",
    );
  });

  next();
}
