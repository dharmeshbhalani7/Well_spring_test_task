import { Creator } from "@/lib/api";

export const AUTH_ACTION_TYPES = {
  HYDRATE_START: "auth/HYDRATE_START",
  HYDRATE_SUCCESS: "auth/HYDRATE_SUCCESS",
  HYDRATE_FAILURE: "auth/HYDRATE_FAILURE",
  LOGIN_REQUEST: "auth/LOGIN_REQUEST",
  LOGIN_SUCCESS: "auth/LOGIN_SUCCESS",
  LOGIN_FAILURE: "auth/LOGIN_FAILURE",
  SIGNUP_REQUEST: "auth/SIGNUP_REQUEST",
  SIGNUP_SUCCESS: "auth/SIGNUP_SUCCESS",
  SIGNUP_FAILURE: "auth/SIGNUP_FAILURE",
  LOGOUT: "auth/LOGOUT",
  SESSION_EXPIRED: "auth/SESSION_EXPIRED",
  CLEAR_SESSION_EXPIRED: "auth/CLEAR_SESSION_EXPIRED",
} as const;

export interface AuthState {
  creator: Creator | null;
  token: string | null;
  isLoading: boolean;
  sessionExpired: boolean;
}

export const initialAuthState: AuthState = {
  creator: null,
  token: null,
  isLoading: true,
  sessionExpired: false,
};
