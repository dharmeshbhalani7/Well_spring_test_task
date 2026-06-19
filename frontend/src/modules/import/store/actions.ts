import { importApi, ApiRequestError } from "@/lib/api";
import { AppThunk } from "@/store/types";
import { IMPORT_ACTION_TYPES } from "./types";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiRequestError ? err.message : fallback;
}

export function uploadRequest() {
  return { type: IMPORT_ACTION_TYPES.UPLOAD_REQUEST } as const;
}

export function uploadSuccess(result: import("@/lib/types").ImportResult) {
  return { type: IMPORT_ACTION_TYPES.UPLOAD_SUCCESS, payload: result } as const;
}

export function uploadFailure(error: string) {
  return { type: IMPORT_ACTION_TYPES.UPLOAD_FAILURE, payload: error } as const;
}

export function resetImport() {
  return { type: IMPORT_ACTION_TYPES.RESET } as const;
}

export function setIdempotencyKey(key: string) {
  return { type: IMPORT_ACTION_TYPES.SET_IDEMPOTENCY_KEY, payload: key } as const;
}

export function uploadCsv(
  programId: string,
  file: File,
  reuseKey?: string,
): AppThunk {
  return async (dispatch, getState) => {
    dispatch(uploadRequest());
    const key = reuseKey ?? crypto.randomUUID();
    if (!reuseKey) {
      dispatch(setIdempotencyKey(key));
    }
    try {
      const token = getState().auth.token;
      const res = await importApi.uploadCsv(programId, file, key, token);
      dispatch(uploadSuccess(res));
    } catch (err) {
      dispatch(uploadFailure(getErrorMessage(err, "Import failed")));
    }
  };
}

export type ImportAction = ReturnType<
  | typeof uploadRequest
  | typeof uploadSuccess
  | typeof uploadFailure
  | typeof resetImport
  | typeof setIdempotencyKey
>;
