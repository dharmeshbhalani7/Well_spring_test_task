import { Request, Response } from "express";
import { withTenantContext } from "../../../db/client";
import { asyncHandler } from "../../../shared/asyncHandler";
import { badRequest } from "../../../shared/errors";
import { param } from "../../../shared/params";
import * as importService from "../services/import.service";

export const bulkImportController = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;
    const programId = param(req.params.programId);
    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (!req.file) {
      throw badRequest("CSV file is required (field name: file)");
    }

    const result = await withTenantContext(tenantId, (tx) =>
      importService.processBulkImport(
        tx,
        tenantId,
        actorId,
        programId,
        idempotencyKey,
        req.file!.buffer,
      ),
    );

    res.status(201).json(result);
  },
);
