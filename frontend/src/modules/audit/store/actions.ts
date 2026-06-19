import { auditApi, ApiRequestError } from "@/lib/api";
import { AppThunk } from "@/store/types";
import { AUDIT_ACTION_TYPES, AuditFilters } from "./types";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiRequestError ? err.message : fallback;
}

export function fetchAuditRequest() {
  return { type: AUDIT_ACTION_TYPES.FETCH_REQUEST } as const;
}

export function fetchAuditSuccess(
  items: import("@/lib/types").AuditLog[],
  totalPages: number,
) {
  return {
    type: AUDIT_ACTION_TYPES.FETCH_SUCCESS,
    payload: { items, totalPages },
  } as const;
}

export function fetchAuditFailure(error: string) {
  return {
    type: AUDIT_ACTION_TYPES.FETCH_FAILURE,
    payload: error,
  } as const;
}

export function setAuditPage(page: number) {
  return { type: AUDIT_ACTION_TYPES.SET_PAGE, payload: page } as const;
}

export function setAuditFilters(filters: Partial<AuditFilters>) {
  return { type: AUDIT_ACTION_TYPES.SET_FILTERS, payload: filters } as const;
}

export function fetchAuditLogs(): AppThunk {
  return async (dispatch, getState) => {
    const { page, filters } = getState().audit;
    dispatch(fetchAuditRequest());
    try {
      const token = getState().auth.token;
      const res = await auditApi.list(
        {
          page,
          limit: 50,
          from: filters.from ? new Date(filters.from).toISOString() : undefined,
          to: filters.to ? new Date(filters.to).toISOString() : undefined,
          action: filters.action || undefined,
        },
        token,
      );
      dispatch(fetchAuditSuccess(res.items, res.pagination.totalPages));
    } catch (err) {
      dispatch(fetchAuditFailure(getErrorMessage(err, "Failed to load logs")));
    }
  };
}

export type AuditAction = ReturnType<
  | typeof fetchAuditRequest
  | typeof fetchAuditSuccess
  | typeof fetchAuditFailure
  | typeof setAuditPage
  | typeof setAuditFilters
>;
