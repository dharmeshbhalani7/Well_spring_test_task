import { ImportResult } from "@/lib/types";

export const IMPORT_ACTION_TYPES = {
  UPLOAD_REQUEST: "import/UPLOAD_REQUEST",
  UPLOAD_SUCCESS: "import/UPLOAD_SUCCESS",
  UPLOAD_FAILURE: "import/UPLOAD_FAILURE",
  RESET: "import/RESET",
  SET_IDEMPOTENCY_KEY: "import/SET_IDEMPOTENCY_KEY",
} as const;

export interface ImportState {
  result: ImportResult | null;
  error: string | null;
  loading: boolean;
  idempotencyKey: string | null;
}

export const initialImportState: ImportState = {
  result: null,
  error: null,
  loading: false,
  idempotencyKey: null,
};
