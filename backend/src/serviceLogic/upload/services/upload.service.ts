import { PrismaClient } from "@prisma/client";
import { createPresignedUploadUrl } from "../lib/s3";
import { getProgram } from "../../program/services/program.service";
import { createRequestLogger } from "../../../shared/logger";

export async function presignUpload(
  tx: PrismaClient,
  tenantId: string,
  programId: string,
  filename: string,
  contentType: string,
  requestId: string,
) {
  await getProgram(tx, tenantId, programId);

  const result = await createPresignedUploadUrl(
    tenantId,
    programId,
    filename,
    contentType,
  );

  const log = createRequestLogger({
    request_id: requestId,
    tenant_id: tenantId,
  });
  log.info(
    { programId, key: result.key, expiresAt: result.expiresAt },
    "S3 presigned URL generated",
  );

  return result;
}
