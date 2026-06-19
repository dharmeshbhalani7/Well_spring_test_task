import { PrismaClient } from "@prisma/client";
import { notFound, badRequest } from "../../../shared/errors";
import { getProgram } from "../../program/services/program.service";
import { logAudit } from "../../audit/services/audit.service";

export async function listSessions(
  tx: PrismaClient,
  tenantId: string,
  programId: string,
) {
  await getProgram(tx, tenantId, programId);

  return tx.session.findMany({
    where: { tenantId, programId },
    orderBy: { position: "asc" },
  });
}

export async function getSession(
  tx: PrismaClient,
  tenantId: string,
  programId: string,
  sessionId: string,
) {
  const session = await tx.session.findFirst({
    where: { id: sessionId, tenantId, programId },
  });
  if (!session) throw notFound("Session not found");
  return session;
}

async function getNextPosition(
  tx: PrismaClient,
  programId: string,
): Promise<number> {
  const max = await tx.session.aggregate({
    where: { programId },
    _max: { position: true },
  });
  return (max._max.position ?? 0) + 1;
}

export async function createSession(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  programId: string,
  data: {
    title: string;
    durationSeconds: number;
    instructorName: string;
    tags?: string[];
    mediaUrl?: string;
    position?: number;
    clientRowId?: string;
  },
) {
  await getProgram(tx, tenantId, programId);

  if (data.clientRowId) {
    const existing = await tx.session.findFirst({
      where: { tenantId, clientRowId: data.clientRowId },
    });
    if (existing) {
      return existing;
    }
  }

  const position = data.position ?? (await getNextPosition(tx, programId));

  const session = await tx.session.create({
    data: {
      tenantId,
      programId,
      position,
      title: data.title,
      durationSeconds: data.durationSeconds,
      instructorName: data.instructorName,
      tags: data.tags ?? [],
      mediaUrl: data.mediaUrl,
      clientRowId: data.clientRowId,
    },
  });

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "CREATE",
    entityType: "session",
    entityId: session.id,
    metadata: { programId, title: session.title },
  });

  return session;
}

export async function updateSession(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  programId: string,
  sessionId: string,
  data: {
    title?: string;
    durationSeconds?: number;
    instructorName?: string;
    tags?: string[];
    mediaUrl?: string | null;
  },
) {
  await getSession(tx, tenantId, programId, sessionId);

  const session = await tx.session.update({
    where: { id: sessionId },
    data,
  });

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "UPDATE",
    entityType: "session",
    entityId: session.id,
    metadata: { programId, ...data },
  });

  return session;
}

export async function deleteSession(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  programId: string,
  sessionId: string,
) {
  const session = await getSession(tx, tenantId, programId, sessionId);

  await tx.session.delete({ where: { id: sessionId } });

  const remaining = await tx.session.findMany({
    where: { programId, tenantId },
    orderBy: { position: "asc" },
  });

  for (let i = 0; i < remaining.length; i++) {
    const targetPosition = i + 1;
    if (remaining[i].position !== targetPosition) {
      await tx.session.update({
        where: { id: remaining[i].id },
        data: { position: -1000 - i },
      });
    }
  }

  for (let i = 0; i < remaining.length; i++) {
    await tx.session.update({
      where: { id: remaining[i].id },
      data: { position: i + 1 },
    });
  }

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "DELETE",
    entityType: "session",
    entityId: session.id,
    metadata: { programId, title: session.title },
  });
}

export async function reorderSessions(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  programId: string,
  sessionIds: string[],
) {
  await getProgram(tx, tenantId, programId);

  const sessions = await tx.session.findMany({
    where: { tenantId, programId },
    orderBy: { position: "asc" },
  });

  if (sessionIds.length !== sessions.length) {
    throw badRequest("sessionIds must include all sessions for the program");
  }

  const sessionIdSet = new Set(sessions.map((s) => s.id));
  for (const id of sessionIds) {
    if (!sessionIdSet.has(id)) {
      throw badRequest(`Session ${id} does not belong to this program`);
    }
  }

  for (let i = 0; i < sessionIds.length; i++) {
    await tx.session.update({
      where: { id: sessionIds[i] },
      data: { position: -1000 - i },
    });
  }

  for (let i = 0; i < sessionIds.length; i++) {
    await tx.session.update({
      where: { id: sessionIds[i] },
      data: { position: i + 1 },
    });
  }

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "REORDER",
    entityType: "session",
    entityId: programId,
    metadata: { programId, sessionIds },
  });

  return tx.session.findMany({
    where: { tenantId, programId },
    orderBy: { position: "asc" },
  });
}
