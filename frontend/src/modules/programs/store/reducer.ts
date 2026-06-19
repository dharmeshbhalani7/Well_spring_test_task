import { AnyAction } from "redux";
import { PROGRAMS_ACTION_TYPES, ProgramsState, initialProgramsState } from "./types";

export function programsReducer(
  state: ProgramsState = initialProgramsState,
  action: AnyAction,
): ProgramsState {
  switch (action.type) {
    case PROGRAMS_ACTION_TYPES.FETCH_LIST_REQUEST:
      return { ...state, loading: true, error: null };
    case PROGRAMS_ACTION_TYPES.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, list: action.payload, error: null };
    case PROGRAMS_ACTION_TYPES.FETCH_LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case PROGRAMS_ACTION_TYPES.FETCH_ONE_REQUEST:
      return { ...state, loading: true, error: null };
    case PROGRAMS_ACTION_TYPES.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload, error: null };
    case PROGRAMS_ACTION_TYPES.FETCH_ONE_FAILURE:
      return { ...state, loading: false, current: null, error: action.payload };
    case PROGRAMS_ACTION_TYPES.CREATE_REQUEST:
      return { ...state, saveError: null };
    case PROGRAMS_ACTION_TYPES.CREATE_FAILURE:
      return { ...state, saveError: action.payload };
    case PROGRAMS_ACTION_TYPES.UPDATE_REQUEST:
      return { ...state, saveError: null };
    case PROGRAMS_ACTION_TYPES.UPDATE_SUCCESS:
      return {
        ...state,
        current: action.payload,
        saveError: null,
      };
    case PROGRAMS_ACTION_TYPES.UPDATE_FAILURE:
      return { ...state, saveError: action.payload };
    case PROGRAMS_ACTION_TYPES.DELETE_REQUEST:
      return { ...state, error: null };
    case PROGRAMS_ACTION_TYPES.CLEAR_SAVE_ERROR:
      return { ...state, saveError: null };
  }
  return state;
}
