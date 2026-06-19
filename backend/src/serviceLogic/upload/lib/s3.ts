import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../../config/env";

function resolveS3Credentials() {
  if (env.AWS_ENDPOINT_URL) {
    return {
      accessKeyId: env.AWS_ACCESS_KEY_ID || "test",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "test",
    };
  }
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    };
  }
  return undefined;
}

const credentials = resolveS3Credentials();

const s3Client = new S3Client({
  region: env.AWS_REGION,
  ...(env.AWS_ENDPOINT_URL
    ? { endpoint: env.AWS_ENDPOINT_URL, forcePathStyle: true }
    : {}),
  ...(credentials ? { credentials } : {}),
});

function buildMediaUrl(key: string): string {
  if (env.AWS_ENDPOINT_URL) {
    const base = env.AWS_ENDPOINT_URL.replace(/\/$/, "");
    return `${base}/${env.S3_BUCKET}/${key}`;
  }
  return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

export interface PresignResult {
  uploadUrl: string;
  mediaUrl: string;
  key: string;
  expiresAt: string;
}

export async function createPresignedUploadUrl(
  tenantId: string,
  programId: string,
  filename: string,
  contentType: string,
): Promise<PresignResult> {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `tenants/${tenantId}/programs/${programId}/${uuidv4()}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: env.S3_PRESIGN_EXPIRES_SECONDS,
  });

  const mediaUrl = buildMediaUrl(key);
  const expiresAt = new Date(
    Date.now() + env.S3_PRESIGN_EXPIRES_SECONDS * 1000,
  ).toISOString();

  return { uploadUrl, mediaUrl, key, expiresAt };
}
