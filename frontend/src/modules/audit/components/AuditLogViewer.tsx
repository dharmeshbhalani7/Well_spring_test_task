"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAuditLogs,
  setAuditPage,
  setAuditFilters,
} from "@/modules/audit/store/actions";
import { AuditAction } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

const ACTIONS: (AuditAction | "")[] = [
  "",
  "CREATE",
  "UPDATE",
  "DELETE",
  "REORDER",
  "BULK_IMPORT",
];

export function AuditLogViewer() {
  const dispatch = useAppDispatch();
  const { items, page, totalPages, filters, loading, error } = useAppSelector(
    (state) => state.audit,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch, page, filters.from, filters.to, filters.action]);

  const actionVariant = (a: string) => {
    const lower = a.toLowerCase();
    if (lower === "create") return "create" as const;
    if (lower === "update") return "update" as const;
    if (lower === "delete") return "delete" as const;
    return "default" as const;
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-gray-900">Audit Log</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <Input
            label="From"
            type="datetime-local"
            value={filters.from}
            onChange={(e) =>
              dispatch(setAuditFilters({ from: e.target.value }))
            }
          />
          <Input
            label="To"
            type="datetime-local"
            value={filters.to}
            onChange={(e) => dispatch(setAuditFilters({ to: e.target.value }))}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) =>
                dispatch(setAuditFilters({ action: e.target.value }))
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All actions</option>
              {ACTIONS.filter(Boolean).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              onClick={() => dispatch(fetchAuditLogs())}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                dispatch(setAuditFilters({ from: "", to: "", action: "" }))
              }
            >
              Reset filters
            </Button>
          </div>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Time
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Action
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Entity
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Metadata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items?.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={actionVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    {log.entityType}
                    <br />
                    <span className="text-xs text-gray-400">
                      {log.entityId}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {log.metadata ? (
                      <>
                        <button
                          type="button"
                          className="text-teal-600 hover:underline text-xs"
                          onClick={() =>
                            setExpandedId(expandedId === log.id ? null : log.id)
                          }
                        >
                          {expandedId === log.id ? "Hide" : "Show"}
                        </button>
                        {expandedId === log.id && (
                          <pre className="mt-1 max-w-xs overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <p className="py-8 text-center text-gray-500">
              No audit logs found.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => dispatch(setAuditPage(page - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => dispatch(setAuditPage(page + 1))}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
