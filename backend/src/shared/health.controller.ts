import { Request, Response } from "express";
import { asyncHandler } from "../shared/asyncHandler";

export const healthController = asyncHandler(
  async (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  },
);
