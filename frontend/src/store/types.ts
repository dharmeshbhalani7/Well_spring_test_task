import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import type { RootState } from "./index";

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
