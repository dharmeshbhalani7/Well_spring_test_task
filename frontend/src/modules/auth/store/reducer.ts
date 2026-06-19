import { AnyAction } from "redux";
import { AUTH_ACTION_TYPES, AuthState, initialAuthState } from "./types";

export function authReducer(
  state: AuthState = initialAuthState,
  action: AnyAction,
): AuthState {
  switch (action.type) {
    case AUTH_ACTION_TYPES.HYDRATE_START:
      return { ...state, isLoading: true };
    case AUTH_ACTION_TYPES.HYDRATE_SUCCESS:
    case AUTH_ACTION_TYPES.LOGIN_SUCCESS:
    case AUTH_ACTION_TYPES.SIGNUP_SUCCESS:
      return {
        ...state,
        creator: action.payload.creator,
        token: action.payload.token,
        isLoading: false,
        sessionExpired: false,
      };
    case AUTH_ACTION_TYPES.HYDRATE_FAILURE:
    case AUTH_ACTION_TYPES.LOGIN_FAILURE:
    case AUTH_ACTION_TYPES.SIGNUP_FAILURE:
      return {
        ...state,
        creator: null,
        token: null,
        isLoading: false,
      };
    case AUTH_ACTION_TYPES.LOGIN_REQUEST:
    case AUTH_ACTION_TYPES.SIGNUP_REQUEST:
      return state;
    case AUTH_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        creator: null,
        token: null,
        isLoading: false,
        sessionExpired: false,
      };
    case AUTH_ACTION_TYPES.SESSION_EXPIRED:
      return {
        ...state,
        creator: null,
        token: null,
        isLoading: false,
        sessionExpired: true,
      };
    case AUTH_ACTION_TYPES.CLEAR_SESSION_EXPIRED:
      return { ...state, sessionExpired: false };
    default:
      return state;
  }
}
