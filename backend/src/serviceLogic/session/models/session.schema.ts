import { z } from "zod";

export const createSessionSchema = z.object({
  title: z.string().min(1).max(200),
  durationSeconds: z.number().int().positive(),
  instructorName: z.string().min(1).max(100),
  tags: z.array(z.string()).optional(),
  mediaUrl: z.string().url().optional(),
  position: z.number().int().positive().optional(),
  clientRowId: z.string().optional(),
});

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  durationSeconds: z.number().int().positive().optional(),
  instructorName: z.string().min(1).max(100).optional(),
  tags: z.array(z.string()).optional(),
  mediaUrl: z.string().url().nullable().optional(),
});

export const reorderSessionsSchema = z.object({
  sessionIds: z.array(z.string().uuid()).min(1),
});
