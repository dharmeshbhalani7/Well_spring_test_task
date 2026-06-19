import { AnyAction } from "redux";
import { AUDIT_ACTION_TYPES, AuditState, initialAuditState } from "./types";

export function auditReducer(
  state: AuditState = initialAuditState,
  action: AnyAction,
): AuditState {
  switch (action.type) {
    case AUDIT_ACTION_TYPES.FETCH_REQUEST:
      return { ...state, loading: true, error: null };
    case AUDIT_ACTION_TYPES.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.items,
        totalPages: action.payload.totalPages,
        error: null,
      };
    case AUDIT_ACTION_TYPES.FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case AUDIT_ACTION_TYPES.SET_PAGE:
      return { ...state, page: action.payload };
    case AUDIT_ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        page: 1,
      };
    default:
      return state;
  }
}
