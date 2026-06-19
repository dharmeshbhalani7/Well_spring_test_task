"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { uploadCsv, resetImport } from "@/modules/import/store/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const CSV_TEMPLATE = `client_row_id,title,duration_seconds,instructor_name,tags,media_url
row-1,Sample Session,600,Coach Name,sleep|relaxation,https://cdn.example.com/sample.mp3`;

export function CsvUpload({ programId }: { programId: string }) {
  const dispatch = useAppDispatch();
  const { result, error, loading, idempotencyKey } = useAppSelector(
    (state) => state.import,
  );
  const [file, setFile] = useState<File | null>(null);

  const runImport = (reuseKey?: string) => {
    if (!file) return;
    dispatch(uploadCsv(programId, file, reuseKey));
  };

  const statusVariant = (status: string) => {
    if (status === "success") return "success" as const;
    if (status === "error") return "error" as const;
    return "skipped" as const;
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-gray-900">Bulk CSV Import</h2>
        <p className="mt-2 text-sm text-gray-500">
          Upload a CSV with columns:{" "}
          <code className="text-xs">
            client_row_id, title, duration_seconds, instructor_name, tags,
            media_url
          </code>
          . Tags are pipe-separated (e.g. sleep|relaxation).
        </p>

        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-teal-600 hover:underline">
            Download CSV template
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-3 text-xs">
            {CSV_TEMPLATE}
          </pre>
        </details>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="mt-4 space-y-4">
          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                dispatch(resetImport());
              }}
              className="sr-only"
            />
            {file ? (
              <span className="text-sm text-gray-700">{file.name}</span>
            ) : (
              <span className="text-sm text-blue-600 hover:underline">
                Choose CSV file
              </span>
            )}
          </label>
          <div className="flex gap-3">
            <Button onClick={() => runImport()} disabled={!file || loading}>
              {loading ? "Importing..." : "Import CSV"}
            </Button>
            {idempotencyKey && file && (
              <Button
                variant="secondary"
                onClick={() => runImport(idempotencyKey)}
                disabled={loading}
              >
                Retry (same idempotency key)
              </Button>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <Card>
          <h3 className="font-semibold text-gray-900">Import results</h3>
          <p className="mt-1 text-sm text-gray-500">
            Job {result.jobId} · {result.succeeded} succeeded · {result.failed}{" "}
            failed
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Row
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Client ID
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.rows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={row.status === "error" ? "bg-red-50" : ""}
                  >
                    <td className="px-4 py-2">{row.rowNumber}</td>
                    <td className="px-4 py-2">{row.clientRowId ?? "—"}</td>
                    <td className="px-4 py-2">
                      <Badge variant={statusVariant(row.status)}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-red-700">
                      {row.errors?.join("; ") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
