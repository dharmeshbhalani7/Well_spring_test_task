import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../serviceLogic/auth/models/auth.types";
import { unauthorized } from "../shared/errors";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(unauthorized("Missing or invalid authorization header"));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.creatorId = payload.sub;
    req.tenantId = payload.sub;
    req.creatorEmail = payload.email;
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
}
