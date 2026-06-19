import { Prisma, PrismaClient } from "@prisma/client";
import { AuditAction, EntityType } from "../../../config/constants";

export interface AuditLogInput {
  tenantId: string;
  actorId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(
  tx: PrismaClient,
  input: AuditLogInput,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export interface AuditLogFilters {
  from?: Date;
  to?: Date;
  action?: string;
  page?: number;
  limit?: number;
}

export async function listAuditLogs(
  tx: PrismaClient,
  tenantId: string,
  filters: AuditLogFilters,
) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 50, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = { tenantId };

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  const [items, total] = await Promise.all([
    tx.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    tx.auditLog.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
