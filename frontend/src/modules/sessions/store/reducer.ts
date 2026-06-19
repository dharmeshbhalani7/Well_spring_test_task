import { AnyAction } from "redux";
import { SESSIONS_ACTION_TYPES, SessionsState, initialSessionsState } from "./types";

export function sessionsReducer(
  state: SessionsState = initialSessionsState,
  action: AnyAction,
): SessionsState {
  switch (action.type) {
    case SESSIONS_ACTION_TYPES.FETCH_LIST_REQUEST:
    case SESSIONS_ACTION_TYPES.FETCH_ONE_REQUEST:
      return { ...state, loading: true, error: null };
    case SESSIONS_ACTION_TYPES.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, list: action.payload, error: null };
    case SESSIONS_ACTION_TYPES.FETCH_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SESSIONS_ACTION_TYPES.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload, error: null };
    case SESSIONS_ACTION_TYPES.FETCH_ONE_FAILURE:
      return { ...state, loading: false, current: null, error: action.payload };
    case SESSIONS_ACTION_TYPES.OPTIMISTIC_REORDER:
      return { ...state, list: action.payload, reorderError: null };
    case SESSIONS_ACTION_TYPES.REORDER_SUCCESS:
      return { ...state, list: action.payload, reorderError: null };
    case SESSIONS_ACTION_TYPES.REORDER_FAILURE:
      return {
        ...state,
        list: action.payload.previous,
        reorderError: action.payload.error,
      };
    case SESSIONS_ACTION_TYPES.CREATE_FAILURE:
    case SESSIONS_ACTION_TYPES.UPDATE_FAILURE:
    case SESSIONS_ACTION_TYPES.DELETE_FAILURE:
      return { ...state, error: action.payload };
  }
  return state;
}
