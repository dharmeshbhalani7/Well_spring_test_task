import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, signup, logout } from "./store/actions";

export function useAuth() {
  const dispatch = useAppDispatch();
  const creator = useAppSelector((state) => state.auth.creator);
  const token = useAppSelector((state) => state.auth.token);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  return {
    creator,
    token,
    isLoading,
    login: useCallback(
      (email: string, password: string) => dispatch(login(email, password)),
      [dispatch],
    ),
    signup: useCallback(
      (email: string, password: string, displayName: string) =>
        dispatch(signup(email, password, displayName)),
      [dispatch],
    ),
    logout: useCallback(() => dispatch(logout()), [dispatch]),
  };
}

export function useAuthToken() {
  return useAppSelector((state) => state.auth.token);
}

export function useSessionExpired() {
  return useAppSelector((state) => state.auth.sessionExpired);
}
