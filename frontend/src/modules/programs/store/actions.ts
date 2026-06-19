import { programsApi, ApiRequestError } from "@/lib/api";
import { AppThunk } from "@/store/types";
import { PROGRAMS_ACTION_TYPES } from "./types";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiRequestError ? err.message : fallback;
}

export function fetchProgramsRequest() {
  return { type: PROGRAMS_ACTION_TYPES.FETCH_LIST_REQUEST } as const;
}

export function fetchProgramsSuccess(programs: import("@/lib/types").Program[]) {
  return {
    type: PROGRAMS_ACTION_TYPES.FETCH_LIST_SUCCESS,
    payload: programs,
  } as const;
}

export function fetchProgramsFailure(error: string) {
  return {
    type: PROGRAMS_ACTION_TYPES.FETCH_LIST_FAILURE,
    payload: error,
  } as const;
}

export function fetchProgramRequest() {
  return { type: PROGRAMS_ACTION_TYPES.FETCH_ONE_REQUEST } as const;
}

export function fetchProgramSuccess(program: import("@/lib/types").Program) {
  return {
    type: PROGRAMS_ACTION_TYPES.FETCH_ONE_SUCCESS,
    payload: program,
  } as const;
}

export function fetchProgramFailure(error: string) {
  return {
    type: PROGRAMS_ACTION_TYPES.FETCH_ONE_FAILURE,
    payload: error,
  } as const;
}

export function updateProgramRequest() {
  return { type: PROGRAMS_ACTION_TYPES.UPDATE_REQUEST } as const;
}

export function updateProgramSuccess(program: import("@/lib/types").Program) {
  return {
    type: PROGRAMS_ACTION_TYPES.UPDATE_SUCCESS,
    payload: program,
  } as const;
}

export function updateProgramFailure(error: string) {
  return {
    type: PROGRAMS_ACTION_TYPES.UPDATE_FAILURE,
    payload: error,
  } as const;
}

export function deleteProgramRequest() {
  return { type: PROGRAMS_ACTION_TYPES.DELETE_REQUEST } as const;
}

export function deleteProgramSuccess() {
  return { type: PROGRAMS_ACTION_TYPES.DELETE_SUCCESS } as const;
}

export function deleteProgramFailure(error: string) {
  return {
    type: PROGRAMS_ACTION_TYPES.DELETE_FAILURE,
    payload: error,
  } as const;
}

export function clearSaveError() {
  return { type: PROGRAMS_ACTION_TYPES.CLEAR_SAVE_ERROR } as const;
}

export function fetchPrograms(): AppThunk {
  return async (dispatch, getState) => {
    dispatch(fetchProgramsRequest());
    try {
      const token = getState().auth.token;
      const res = await programsApi.list(token);
      dispatch(fetchProgramsSuccess(res.programs));
    } catch (err) {
      dispatch(fetchProgramsFailure(getErrorMessage(err, "Failed to load programs")));
    }
  };
}

export function fetchProgram(programId: string): AppThunk {
  return async (dispatch, getState) => {
    dispatch(fetchProgramRequest());
    try {
      const token = getState().auth.token;
      const res = await programsApi.get(programId, token);
      dispatch(fetchProgramSuccess(res.program));
    } catch (err) {
      dispatch(fetchProgramFailure(getErrorMessage(err, "Failed to load program")));
    }
  };
}

export function createProgram(data: {
  title: string;
  description?: string;
}): AppThunk<Promise<import("@/lib/types").Program>> {
  return async (dispatch, getState) => {
    dispatch({ type: PROGRAMS_ACTION_TYPES.CREATE_REQUEST });
    try {
      const token = getState().auth.token;
      const res = await programsApi.create(data, token);
      dispatch({ type: PROGRAMS_ACTION_TYPES.CREATE_SUCCESS, payload: res.program });
      return res.program;
    } catch (err) {
      const message = getErrorMessage(err, "Create failed");
      dispatch({ type: PROGRAMS_ACTION_TYPES.CREATE_FAILURE, payload: message });
      throw err;
    }
  };
}

export function updateProgram(
  programId: string,
  data: { title: string; description?: string | null },
): AppThunk {
  return async (dispatch, getState) => {
    dispatch(updateProgramRequest());
    try {
      const token = getState().auth.token;
      const res = await programsApi.update(programId, data, token);
      dispatch(updateProgramSuccess(res.program));
    } catch (err) {
      dispatch(updateProgramFailure(getErrorMessage(err, "Update failed")));
    }
  };
}

export function deleteProgram(programId: string): AppThunk {
  return async (dispatch, getState) => {
    dispatch(deleteProgramRequest());
    try {
      const token = getState().auth.token;
      await programsApi.delete(programId, token);
      dispatch(deleteProgramSuccess());
      dispatch(fetchPrograms());
    } catch (err) {
      dispatch(deleteProgramFailure(getErrorMessage(err, "Delete failed")));
      throw err;
    }
  };
}

export type ProgramsAction = ReturnType<
  | typeof fetchProgramsRequest
  | typeof fetchProgramsSuccess
  | typeof fetchProgramsFailure
  | typeof fetchProgramRequest
  | typeof fetchProgramSuccess
  | typeof fetchProgramFailure
  | typeof updateProgramRequest
  | typeof updateProgramSuccess
  | typeof updateProgramFailure
  | typeof deleteProgramRequest
  | typeof deleteProgramSuccess
  | typeof deleteProgramFailure
  | typeof clearSaveError
> | {
  type: typeof PROGRAMS_ACTION_TYPES.CREATE_REQUEST;
} | {
  type: typeof PROGRAMS_ACTION_TYPES.CREATE_SUCCESS;
  payload: import("@/lib/types").Program;
} | {
  type: typeof PROGRAMS_ACTION_TYPES.CREATE_FAILURE;
  payload: string;
};
