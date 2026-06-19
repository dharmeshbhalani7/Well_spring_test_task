import { Request, Response } from "express";
import { createProgramSchema } from "../models/program.schema";
import * as programService from "../services/program.service";
import { updateProgramSchema } from "../models/program.schema";
import { asyncHandler } from "../../../shared/asyncHandler";
import { withTenantContext } from "../../../db/client";
import { param } from "../../../shared/params";

export const createProgramController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createProgramSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;

    const program = await withTenantContext(tenantId, (tx) =>
      programService.createProgram(tx, tenantId, actorId, body),
    );
    res.status(201).json({ program });
  },
);

export const deleteProgramController = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;

    await withTenantContext(tenantId, (tx) =>
      programService.deleteProgram(tx, tenantId, actorId, param(req.params.id)),
    );
    res.status(204).send();
  },
);

export const getProgramController = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const program = await withTenantContext(tenantId, (tx) =>
      programService.getProgram(tx, tenantId, param(req.params.id)),
    );
    res.json({ program });
  },
);

export const listProgramsController = asyncHandler(
  async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const programs = await withTenantContext(tenantId, (tx) =>
      programService.listPrograms(tx, tenantId),
    );
    res.json({ programs });
  },
);

export const updateProgramController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = updateProgramSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const actorId = req.creatorId!;

    const program = await withTenantContext(tenantId, (tx) =>
      programService.updateProgram(
        tx,
        tenantId,
        actorId,
        param(req.params.id),
        body,
      ),
    );
    res.json({ program });
  },
);
