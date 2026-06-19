import { AnyAction } from "redux";
import { IMPORT_ACTION_TYPES, ImportState, initialImportState } from "./types";

export function importReducer(
  state: ImportState = initialImportState,
  action: AnyAction,
): ImportState {
  switch (action.type) {
    case IMPORT_ACTION_TYPES.UPLOAD_REQUEST:
      return { ...state, loading: true, error: null };
    case IMPORT_ACTION_TYPES.UPLOAD_SUCCESS:
      return { ...state, loading: false, result: action.payload, error: null };
    case IMPORT_ACTION_TYPES.UPLOAD_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case IMPORT_ACTION_TYPES.RESET:
      return { ...initialImportState };
    case IMPORT_ACTION_TYPES.SET_IDEMPOTENCY_KEY:
      return { ...state, idempotencyKey: action.payload };
    default:
      return state;
  }
}
