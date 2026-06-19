import { Program } from "@/lib/types";

export const PROGRAMS_ACTION_TYPES = {
  FETCH_LIST_REQUEST: "programs/FETCH_LIST_REQUEST",
  FETCH_LIST_SUCCESS: "programs/FETCH_LIST_SUCCESS",
  FETCH_LIST_FAILURE: "programs/FETCH_LIST_FAILURE",
  FETCH_ONE_REQUEST: "programs/FETCH_ONE_REQUEST",
  FETCH_ONE_SUCCESS: "programs/FETCH_ONE_SUCCESS",
  FETCH_ONE_FAILURE: "programs/FETCH_ONE_FAILURE",
  CREATE_REQUEST: "programs/CREATE_REQUEST",
  CREATE_SUCCESS: "programs/CREATE_SUCCESS",
  CREATE_FAILURE: "programs/CREATE_FAILURE",
  UPDATE_REQUEST: "programs/UPDATE_REQUEST",
  UPDATE_SUCCESS: "programs/UPDATE_SUCCESS",
  UPDATE_FAILURE: "programs/UPDATE_FAILURE",
  DELETE_REQUEST: "programs/DELETE_REQUEST",
  DELETE_SUCCESS: "programs/DELETE_SUCCESS",
  DELETE_FAILURE: "programs/DELETE_FAILURE",
  CLEAR_SAVE_ERROR: "programs/CLEAR_SAVE_ERROR",
} as const;

export interface ProgramsState {
  list: Program[];
  current: Program | null;
  loading: boolean;
  error: string | null;
  saveError: string | null;
}

export const initialProgramsState: ProgramsState = {
  list: [],
  current: null,
  loading: false,
  error: null,
  saveError: null,
};
