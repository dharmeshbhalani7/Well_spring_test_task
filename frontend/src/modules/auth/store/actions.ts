import { AnyAction } from "redux";
import { authApi, Creator } from "@/lib/api";
import {
  clearToken,
  getStoredCreator,
  getToken,
  setStoredCreator,
  setToken,
} from "@/lib/auth-storage";
import { AppThunk } from "@/store/types";
import { AUTH_ACTION_TYPES } from "./types";

export function hydrateStart() {
  return { type: AUTH_ACTION_TYPES.HYDRATE_START } as const;
}

export function hydrateSuccess(creator: Creator, token: string) {
  return {
    type: AUTH_ACTION_TYPES.HYDRATE_SUCCESS,
    payload: { creator, token },
  } as const;
}

export function hydrateFailure() {
  return { type: AUTH_ACTION_TYPES.HYDRATE_FAILURE } as const;
}

export function loginRequest() {
  return { type: AUTH_ACTION_TYPES.LOGIN_REQUEST } as const;
}

export function loginSuccess(creator: Creator, token: string) {
  return {
    type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
    payload: { creator, token },
  } as const;
}

export function loginFailure() {
  return { type: AUTH_ACTION_TYPES.LOGIN_FAILURE } as const;
}

export function signupRequest() {
  return { type: AUTH_ACTION_TYPES.SIGNUP_REQUEST } as const;
}

export function signupSuccess(creator: Creator, token: string) {
  return {
    type: AUTH_ACTION_TYPES.SIGNUP_SUCCESS,
    payload: { creator, token },
  } as const;
}

export function signupFailure() {
  return { type: AUTH_ACTION_TYPES.SIGNUP_FAILURE } as const;
}

export function logout() {
  clearToken();
  return { type: AUTH_ACTION_TYPES.LOGOUT } as const;
}

export function sessionExpired() {
  clearToken();
  return { type: AUTH_ACTION_TYPES.SESSION_EXPIRED } as const;
}

export function clearSessionExpired() {
  return { type: AUTH_ACTION_TYPES.CLEAR_SESSION_EXPIRED } as const;
}

function persistAuth(creator: Creator, token: string) {
  setToken(token);
  setStoredCreator(JSON.stringify(creator));
}

export function hydrateAuth(): AppThunk {
  return (dispatch) => {
    dispatch(hydrateStart());
    const storedToken = getToken();
    const storedCreator = getStoredCreator();
    if (storedToken && storedCreator) {
      try {
        const creator = JSON.parse(storedCreator) as Creator;
        dispatch(hydrateSuccess(creator, storedToken));
        return;
      } catch {
        clearToken();
      }
    }
    dispatch(hydrateFailure());
  };
}

export function login(
  email: string,
  password: string,
): AppThunk<Promise<void>> {
  return async (dispatch) => {
    dispatch(loginRequest());
    try {
      const res = await authApi.login({ email, password });
      persistAuth(res.creator, res.token);
      dispatch(loginSuccess(res.creator, res.token));
    } catch (err) {
      dispatch(loginFailure());
      throw err;
    }
  };
}

export function signup(
  email: string,
  password: string,
  displayName: string,
): AppThunk<Promise<void>> {
  return async (dispatch) => {
    dispatch(signupRequest());
    try {
      const res = await authApi.signup({ email, password, displayName });
      persistAuth(res.creator, res.token);
      dispatch(signupSuccess(res.creator, res.token));
    } catch (err) {
      dispatch(signupFailure());
      throw err;
    }
  };
}

export type AuthAction = ReturnType<
  | typeof hydrateStart
  | typeof hydrateSuccess
  | typeof hydrateFailure
  | typeof loginRequest
  | typeof loginSuccess
  | typeof loginFailure
  | typeof signupRequest
  | typeof signupSuccess
  | typeof signupFailure
  | typeof logout
  | typeof sessionExpired
  | typeof clearSessionExpired
>;

export function isAuthAction(action: AnyAction): action is AuthAction {
  return action.type.startsWith("auth/");
}
