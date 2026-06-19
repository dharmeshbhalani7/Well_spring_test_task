import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("24h"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT_URL: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().url().optional(),
  ),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().default("wellspring-media-dev"),
  S3_PRESIGN_EXPIRES_SECONDS: z.coerce.number().default(900),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.string().default("info"),
  APP_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
