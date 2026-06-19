import { sessionsApi, ApiRequestError } from "@/lib/api";
import { Session } from "@/lib/types";
import { AppThunk } from "@/store/types";
import { SESSIONS_ACTION_TYPES } from "./types";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiRequestError ? err.message : fallback;
}

export function fetchSessionsRequest() {
  return { type: SESSIONS_ACTION_TYPES.FETCH_LIST_REQUEST } as const;
}

export function fetchSessionsSuccess(sessions: Session[]) {
  return {
    type: SESSIONS_ACTION_TYPES.FETCH_LIST_SUCCESS,
    payload: sessions,
  } as const;
}

export function fetchSessionsFailure(error: string) {
  return {
    type: SESSIONS_ACTION_TYPES.FETCH_LIST_FAILURE,
    payload: error,
  } as const;
}

export function fetchSessionRequest() {
  return { type: SESSIONS_ACTION_TYPES.FETCH_ONE_REQUEST } as const;
}

export function fetchSessionSuccess(session: Session) {
  return {
    type: SESSIONS_ACTION_TYPES.FETCH_ONE_SUCCESS,
    payload: session,
  } as const;
}

export function fetchSessionFailure(error: string) {
  return {
    type: SESSIONS_ACTION_TYPES.FETCH_ONE_FAILURE,
    payload: error,
  } as const;
}

export function optimisticReorder(sessions: Session[]) {
  return {
    type: SESSIONS_ACTION_TYPES.OPTIMISTIC_REORDER,
    payload: sessions,
  } as const;
}

export function reorderSuccess(sessions: Session[]) {
  return {
    type: SESSIONS_ACTION_TYPES.REORDER_SUCCESS,
    payload: sessions,
  } as const;
}

export function reorderFailure(error: string, previous: Session[]) {
  return {
    type: SESSIONS_ACTION_TYPES.REORDER_FAILURE,
    payload: { error, previous },
  } as const;
}

export function fetchSessions(programId: string): AppThunk {
  return async (dispatch, getState) => {
    dispatch(fetchSessionsRequest());
    try {
      const token = getState().auth.token;
      const res = await sessionsApi.list(programId, token);
      dispatch(fetchSessionsSuccess(res.sessions));
    } catch (err) {
      dispatch(fetchSessionsFailure(getErrorMessage(err, "Failed to load sessions")));
    }
  };
}

export function fetchSession(
  programId: string,
  sessionId: string,
): AppThunk {
  return async (dispatch, getState) => {
    dispatch(fetchSessionRequest());
    try {
      const token = getState().auth.token;
      const res = await sessionsApi.get(programId, sessionId, token);
      dispatch(fetchSessionSuccess(res.session));
    } catch (err) {
      dispatch(fetchSessionFailure(getErrorMessage(err, "Failed to load session")));
    }
  };
}

export function reorderSessions(
  programId: string,
  sessionIds: string[],
  previous: Session[],
): AppThunk {
  return async (dispatch, getState) => {
    const reordered = sessionIds
      .map((id, i) => {
        const s = previous.find((x) => x.id === id);
        return s ? { ...s, position: i + 1 } : null;
      })
      .filter(Boolean) as Session[];

    dispatch(optimisticReorder(reordered));

    try {
      const token = getState().auth.token;
      const res = await sessionsApi.reorder(programId, sessionIds, token);
      dispatch(reorderSuccess(res.sessions));
    } catch (err) {
      dispatch(
        reorderFailure(
          getErrorMessage(err, "Reorder failed"),
          previous,
        ),
      );
    }
  };
}

export function deleteSession(
  programId: string,
  sessionId: string,
): AppThunk {
  return async (dispatch, getState) => {
    dispatch({ type: SESSIONS_ACTION_TYPES.DELETE_REQUEST });
    try {
      const token = getState().auth.token;
      await sessionsApi.delete(programId, sessionId, token);
      dispatch({ type: SESSIONS_ACTION_TYPES.DELETE_SUCCESS });
      dispatch(fetchSessions(programId));
    } catch (err) {
      const message = getErrorMessage(err, "Delete failed");
      dispatch({ type: SESSIONS_ACTION_TYPES.DELETE_FAILURE, payload: message });
      throw err;
    }
  };
}

export function createSession(
  programId: string,
  data: Parameters<typeof sessionsApi.create>[1],
): AppThunk<Promise<Session>> {
  return async (dispatch, getState) => {
    dispatch({ type: SESSIONS_ACTION_TYPES.CREATE_REQUEST });
    try {
      const token = getState().auth.token;
      const res = await sessionsApi.create(programId, data, token);
      dispatch({ type: SESSIONS_ACTION_TYPES.CREATE_SUCCESS, payload: res.session });
      return res.session;
    } catch (err) {
      const message = getErrorMessage(err, "Create failed");
      dispatch({ type: SESSIONS_ACTION_TYPES.CREATE_FAILURE, payload: message });
      throw err;
    }
  };
}

export function updateSession(
  programId: string,
  sessionId: string,
  data: Parameters<typeof sessionsApi.update>[2],
): AppThunk<Promise<Session>> {
  return async (dispatch, getState) => {
    dispatch({ type: SESSIONS_ACTION_TYPES.UPDATE_REQUEST });
    try {
      const token = getState().auth.token;
      const res = await sessionsApi.update(programId, sessionId, data, token);
      dispatch({ type: SESSIONS_ACTION_TYPES.UPDATE_SUCCESS, payload: res.session });
      return res.session;
    } catch (err) {
      const message = getErrorMessage(err, "Update failed");
      dispatch({ type: SESSIONS_ACTION_TYPES.UPDATE_FAILURE, payload: message });
      throw err;
    }
  };
}

export type SessionsAction =
  | ReturnType<
      | typeof fetchSessionsRequest
      | typeof fetchSessionsSuccess
      | typeof fetchSessionsFailure
      | typeof fetchSessionRequest
      | typeof fetchSessionSuccess
      | typeof fetchSessionFailure
      | typeof optimisticReorder
      | typeof reorderSuccess
      | typeof reorderFailure
    >
  | { type: typeof SESSIONS_ACTION_TYPES.DELETE_REQUEST }
  | { type: typeof SESSIONS_ACTION_TYPES.DELETE_SUCCESS }
  | { type: typeof SESSIONS_ACTION_TYPES.DELETE_FAILURE; payload: string }
  | { type: typeof SESSIONS_ACTION_TYPES.CREATE_REQUEST }
  | { type: typeof SESSIONS_ACTION_TYPES.CREATE_SUCCESS; payload: Session }
  | { type: typeof SESSIONS_ACTION_TYPES.CREATE_FAILURE; payload: string }
  | { type: typeof SESSIONS_ACTION_TYPES.UPDATE_REQUEST }
  | { type: typeof SESSIONS_ACTION_TYPES.UPDATE_SUCCESS; payload: Session }
  | { type: typeof SESSIONS_ACTION_TYPES.UPDATE_FAILURE; payload: string };
