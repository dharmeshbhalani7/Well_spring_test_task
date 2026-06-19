import { AuditLog } from "@/lib/types";

export const AUDIT_ACTION_TYPES = {
  FETCH_REQUEST: "audit/FETCH_REQUEST",
  FETCH_SUCCESS: "audit/FETCH_SUCCESS",
  FETCH_FAILURE: "audit/FETCH_FAILURE",
  SET_PAGE: "audit/SET_PAGE",
  SET_FILTERS: "audit/SET_FILTERS",
} as const;

export interface AuditFilters {
  from: string;
  to: string;
  action: string;
}

export interface AuditState {
  items: AuditLog[];
  page: number;
  totalPages: number;
  filters: AuditFilters;
  loading: boolean;
  error: string | null;
}

export const initialAuditState: AuditState = {
  items: [],
  page: 1,
  totalPages: 1,
  filters: { from: "", to: "", action: "" },
  loading: false,
  error: null,
};
