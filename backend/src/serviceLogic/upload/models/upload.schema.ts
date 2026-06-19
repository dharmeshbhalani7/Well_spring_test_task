import { z } from "zod";

export const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z
    .string()
    .regex(/^(audio|video)\//, "contentType must be audio/* or video/*"),
  programId: z.string().uuid(),
});
