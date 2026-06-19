import { PrismaClient } from "@prisma/client";
import { notFound } from "../../../shared/errors";
import { logAudit } from "../../audit/services/audit.service";

export async function listPrograms(tx: PrismaClient, tenantId: string) {
  return tx.program.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sessions: true } } },
  });
}

export async function getProgram(
  tx: PrismaClient,
  tenantId: string,
  programId: string,
) {
  const program = await tx.program.findFirst({
    where: { id: programId, tenantId },
    include: { _count: { select: { sessions: true } } },
  });
  if (!program) throw notFound("Program not found");
  return program;
}

export async function createProgram(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  data: { title: string; description?: string },
) {
  const program = await tx.program.create({
    data: { tenantId, title: data.title, description: data.description },
  });

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "CREATE",
    entityType: "program",
    entityId: program.id,
    metadata: { title: program.title },
  });

  return program;
}

export async function updateProgram(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  programId: string,
  data: { title?: string; description?: string | null },
) {
  await getProgram(tx, tenantId, programId);

  const program = await tx.program.update({
    where: { id: programId },
    data,
  });

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "UPDATE",
    entityType: "program",
    entityId: program.id,
    metadata: data,
  });

  return program;
}

export async function deleteProgram(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  programId: string,
) {
  const program = await getProgram(tx, tenantId, programId);

  await tx.program.delete({ where: { id: programId } });

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "DELETE",
    entityType: "program",
    entityId: program.id,
    metadata: { title: program.title },
  });
}
