import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

export async function applyRlsPolicies(): Promise<void> {
  const rlsPath = join(
    __dirname,
    "../prisma/migrations/20250617000001_enable_rls/migration.sql",
  );

  if (!existsSync(rlsPath)) {
  const altPath = join(
    process.cwd(),
    "prisma/migrations/20250617000001_enable_rls/migration.sql",
  );
    if (existsSync(altPath)) {
      const sql = readFileSync(altPath, "utf-8");
      await prisma.$executeRawUnsafe(sql);
      return;
    }
    return;
  }

  const statements = readFileSync(rlsPath, "utf-8")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

export async function resetDatabase(): Promise<void> {
  execSync("npx prisma migrate reset --force", {
    cwd: join(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  });
}

export { prisma };
