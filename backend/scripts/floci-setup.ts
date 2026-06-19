/**
 * Creates the S3 bucket and CORS rules on local Floci.
 * Run after Floci is up: npm run floci:setup
 */
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.AWS_ENDPOINT_URL ?? "http://localhost:4566";
const bucket = process.env.S3_BUCKET ?? "wellspring-media-dev";
const region = process.env.AWS_REGION ?? "us-east-1";
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`Bucket "${bucket}" already exists.`);
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log(`Created bucket "${bucket}".`);
  }
}

async function configureCors() {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [appUrl],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }),
  );
  console.log(`CORS configured for origin: ${appUrl}`);
}

async function main() {
  console.log(`Floci endpoint: ${endpoint}`);
  await ensureBucket();
  await configureCors();
  console.log("Floci S3 setup complete.");
}

main().catch((err) => {
  console.error("Floci setup failed. Is Floci running on port 4566?");
  console.error(err);
  process.exit(1);
});
