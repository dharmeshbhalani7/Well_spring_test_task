import { Prisma, PrismaClient } from "@prisma/client";
import { badRequest } from "../../shared/errors";
import { getProgram } from "../../serviceLogic/program/services/program.service";
import { parseCsvBuffer } from "../../serviceLogic/import/lib/csv";
import { createSession } from "../../serviceLogic/session/services/session.service";
import { logAudit } from "../../serviceLogic/audit/services/audit.service";

export interface ImportResult {
  jobId: string;
  succeeded: number;
  failed: number;
  rows: Array<{
    rowNumber: number;
    clientRowId?: string;
    status: string;
    errors?: string[];
    sessionId?: string;
  }>;
}

export async function processBulkImport(
  tx: PrismaClient,
  tenantId: string,
  actorId: string,
  programId: string,
  idempotencyKey: string,
  csvBuffer: Buffer,
): Promise<ImportResult> {
  if (!idempotencyKey) {
    throw badRequest("Idempotency-Key header is required");
  }

  await getProgram(tx, tenantId, programId);

  const existingJob = await tx.importJob.findUnique({
    where: {
      tenantId_idempotencyKey: { tenantId, idempotencyKey },
    },
    include: { rows: true },
  });

  if (existingJob?.status === "completed") {
    return existingJob.resultSummary as unknown as ImportResult;
  }

  let validRows;
  let invalidRows;

  try {
    const parsed = parseCsvBuffer(csvBuffer);
    validRows = parsed.validRows;
    invalidRows = parsed.invalidRows;
  } catch (err) {
    throw badRequest(
      err instanceof Error ? err.message : "Failed to parse CSV",
    );
  }

  const resultRows: ImportResult["rows"] = [];
  let succeeded = 0;
  let failed = invalidRows.length;

  for (const invalid of invalidRows) {
    resultRows.push({
      rowNumber: invalid.rowNumber,
      clientRowId: invalid.clientRowId,
      status: "error",
      errors: invalid.errors,
    });
  }

  const importJob = await tx.importJob.create({
    data: {
      tenantId,
      programId,
      idempotencyKey,
      status: "processing",
      resultSummary: {},
    },
  });

  for (const row of validRows) {
    try {
      const existingSession = await tx.session.findFirst({
        where: { tenantId, clientRowId: row.clientRowId },
      });

      if (existingSession) {
        resultRows.push({
          rowNumber: row.rowNumber,
          clientRowId: row.clientRowId,
          status: "skipped",
          sessionId: existingSession.id,
        });
        succeeded++;

        await tx.importRow.create({
          data: {
            importJobId: importJob.id,
            rowNumber: row.rowNumber,
            clientRowId: row.clientRowId,
            status: "skipped",
            sessionId: existingSession.id,
          },
        });
        continue;
      }

      const session = await createSession(tx, tenantId, actorId, programId, {
        title: row.title,
        durationSeconds: row.durationSeconds,
        instructorName: row.instructorName,
        tags: row.tags,
        mediaUrl: row.mediaUrl,
        clientRowId: row.clientRowId,
      });

      resultRows.push({
        rowNumber: row.rowNumber,
        clientRowId: row.clientRowId,
        status: "success",
        sessionId: session.id,
      });
      succeeded++;

      await tx.importRow.create({
        data: {
          importJobId: importJob.id,
          rowNumber: row.rowNumber,
          clientRowId: row.clientRowId,
          status: "success",
          sessionId: session.id,
        },
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create session";
      resultRows.push({
        rowNumber: row.rowNumber,
        clientRowId: row.clientRowId,
        status: "error",
        errors: [errorMsg],
      });
      failed++;

      await tx.importRow.create({
        data: {
          importJobId: importJob.id,
          rowNumber: row.rowNumber,
          clientRowId: row.clientRowId,
          status: "error",
          errors: [errorMsg] as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }

  const result: ImportResult = {
    jobId: importJob.id,
    succeeded,
    failed,
    rows: resultRows,
  };

  await tx.importJob.update({
    where: { id: importJob.id },
    data: {
      status: "completed",
      resultSummary: result as unknown as Prisma.InputJsonValue,
    },
  });

  await logAudit(tx, {
    tenantId,
    actorId,
    action: "BULK_IMPORT",
    entityType: "import_job",
    entityId: importJob.id,
    metadata: { programId, succeeded, failed, idempotencyKey },
  });

  return result;
}
