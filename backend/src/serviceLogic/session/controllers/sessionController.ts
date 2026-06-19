import { Request, Response } from "express";
import { withTenantContext } from "../../../db/client";
import { asyncHandler } from "../../../shared/asyncHandler";
import { param } from "../../../shared/params";
import { createSessionSchema } from "../models/session.schema";
import * as sessionService from "../services/session.service";
import { reorderSessionsSchema } from "../models/session.schema";
import { updateSessionSchema } from "../models/session.schema";

export const createSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createSessionSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;
    const programId = param(req.params.programId);

    const session = await withTenantContext(tenantId, (tx) =>
      sessionService.createSession(tx, tenantId, actorId, programId, body),
    );
    res.status(201).json({ session });
  },
);

export const deleteSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;
    const programId = param(req.params.programId);

    await withTenantContext(tenantId, (tx) =>
      sessionService.deleteSession(
        tx,
        tenantId,
        actorId,
        programId,
        param(req.params.sessionId),
      ),
    );
    res.status(204).send();
  },
);

export const getSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const programId = param(req.params.programId);

    const session = await withTenantContext(tenantId, (tx) =>
      sessionService.getSession(
        tx,
        tenantId,
        programId,
        param(req.params.sessionId),
      ),
    );
    res.json({ session });
  },
);

export const listSessionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const programId = param(req.params.programId);

    const sessions = await withTenantContext(tenantId, (tx) =>
      sessionService.listSessions(tx, tenantId, programId),
    );
    res.json({ sessions });
  },
);

export const reorderSessionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = reorderSessionsSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;
    const programId = param(req.params.programId);

    const sessions = await withTenantContext(tenantId, (tx) =>
      sessionService.reorderSessions(
        tx,
        tenantId,
        actorId,
        programId,
        body.sessionIds,
      ),
    );
    res.json({ sessions });
  },
);

export const updateSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = updateSessionSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;
    const programId = param(req.params.programId);

    const session = await withTenantContext(tenantId, (tx) =>
      sessionService.updateSession(
        tx,
        tenantId,
        actorId,
        programId,
        param(req.params.sessionId),
        body,
      ),
    );
    res.json({ session });
  },
);
