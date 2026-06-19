import { parse } from "csv-parse/sync";
import { z } from "zod";

export const CSV_COLUMNS = [
  "client_row_id",
  "title",
  "duration_seconds",
  "instructor_name",
  "tags",
  "media_url",
] as const;

const rowSchema = z.object({
  client_row_id: z.string().min(1, "client_row_id is required"),
  title: z.string().min(1, "title is required"),
  duration_seconds: z.coerce
    .number()
    .int()
    .positive("duration_seconds must be a positive integer"),
  instructor_name: z.string().min(1, "instructor_name is required"),
  tags: z.string().optional(),
  media_url: z
    .string()
    .url("media_url must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export interface ParsedCsvRow {
  rowNumber: number;
  clientRowId: string;
  title: string;
  durationSeconds: number;
  instructorName: string;
  tags: string[];
  mediaUrl?: string;
}

export interface RowValidationError {
  rowNumber: number;
  clientRowId?: string;
  errors: string[];
}

export function parseTags(tagsStr?: string): string[] {
  if (!tagsStr?.trim()) return [];
  return tagsStr
    .split("|")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseCsvBuffer(buffer: Buffer): {
  validRows: ParsedCsvRow[];
  invalidRows: RowValidationError[];
} {
  let records: Record<string, string>[];

  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Record<string, string>[];
  } catch {
    throw new Error("Invalid CSV format");
  }

  const validRows: ParsedCsvRow[] = [];
  const invalidRows: RowValidationError[] = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const result = rowSchema.safeParse(record);

    if (!result.success) {
      invalidRows.push({
        rowNumber,
        clientRowId: record.client_row_id,
        errors: result.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        ),
      });
      return;
    }

    const data = result.data;
    validRows.push({
      rowNumber,
      clientRowId: data.client_row_id,
      title: data.title,
      durationSeconds: data.duration_seconds,
      instructorName: data.instructor_name,
      tags: parseTags(data.tags),
      mediaUrl: data.media_url || undefined,
    });
  });

  return { validRows, invalidRows };
}
