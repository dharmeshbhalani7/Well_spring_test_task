import { Request, Response } from "express";
import { auditLogQuerySchema } from "../models/audit.schema";
import * as auditService from "../services/audit.service";
import { withTenantContext } from "../../../db/client";
import { asyncHandler } from "../../../shared/asyncHandler";

export const listAuditLogsController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = auditLogQuerySchema.parse(req.query);
    const tenantId = req.tenantId!;

    const result = await withTenantContext(tenantId, async (tx) =>
      auditService.listAuditLogs(tx, tenantId, {
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        action: query.action,
        page: query.page,
        limit: query.limit,
      }),
    );

    res.json(result);
  },
);
