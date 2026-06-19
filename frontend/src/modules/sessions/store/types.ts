import { Session } from "@/lib/types";

export const SESSIONS_ACTION_TYPES = {
  FETCH_LIST_REQUEST: "sessions/FETCH_LIST_REQUEST",
  FETCH_LIST_SUCCESS: "sessions/FETCH_LIST_SUCCESS",
  FETCH_LIST_FAILURE: "sessions/FETCH_LIST_FAILURE",
  FETCH_ONE_REQUEST: "sessions/FETCH_ONE_REQUEST",
  FETCH_ONE_SUCCESS: "sessions/FETCH_ONE_SUCCESS",
  FETCH_ONE_FAILURE: "sessions/FETCH_ONE_FAILURE",
  CREATE_REQUEST: "sessions/CREATE_REQUEST",
  CREATE_SUCCESS: "sessions/CREATE_SUCCESS",
  CREATE_FAILURE: "sessions/CREATE_FAILURE",
  UPDATE_REQUEST: "sessions/UPDATE_REQUEST",
  UPDATE_SUCCESS: "sessions/UPDATE_SUCCESS",
  UPDATE_FAILURE: "sessions/UPDATE_FAILURE",
  DELETE_REQUEST: "sessions/DELETE_REQUEST",
  DELETE_SUCCESS: "sessions/DELETE_SUCCESS",
  DELETE_FAILURE: "sessions/DELETE_FAILURE",
  REORDER_REQUEST: "sessions/REORDER_REQUEST",
  REORDER_SUCCESS: "sessions/REORDER_SUCCESS",
  REORDER_FAILURE: "sessions/REORDER_FAILURE",
  OPTIMISTIC_REORDER: "sessions/OPTIMISTIC_REORDER",
} as const;

export interface SessionsState {
  list: Session[];
  current: Session | null;
  loading: boolean;
  error: string | null;
  reorderError: string | null;
}

export const initialSessionsState: SessionsState = {
  list: [],
  current: null,
  loading: false,
  error: null,
  reorderError: null,
};
