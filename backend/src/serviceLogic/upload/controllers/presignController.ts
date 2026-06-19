import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/asyncHandler";
import { presignSchema } from "../models/upload.schema";
import * as uploadService from "../services/upload.service";
import { withTenantContext } from "../../../db/client";

export const presignController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = presignSchema.parse(req.body);
    const tenantId = req.tenantId!;

    const result = await withTenantContext(tenantId, (tx) =>
      uploadService.presignUpload(
        tx,
        tenantId,
        body.programId,
        body.filename,
        body.contentType,
        req.requestId,
      ),
    );

    res.json(result);
  },
);
