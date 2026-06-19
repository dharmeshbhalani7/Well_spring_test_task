import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function withTenantContext<T>(
  tenantId: string,
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SELECT set_config('app.current_tenant_id', $1, true)`,
      tenantId,
    );
    return fn(tx as unknown as PrismaClient);
  });
}

export async function withoutTenantContext<T>(
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SELECT set_config('app.current_tenant_id', '', true)`,
    );
    return fn(tx as unknown as PrismaClient);
  });
}
