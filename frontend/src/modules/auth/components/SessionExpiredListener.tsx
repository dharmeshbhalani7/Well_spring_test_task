"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { useSessionExpired } from "../hooks";
import { clearSessionExpired } from "../store/actions";

export function SessionExpiredListener() {
  const sessionExpired = useSessionExpired();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (sessionExpired) {
      router.replace("/login?expired=1");
      dispatch(clearSessionExpired());
    }
  }, [sessionExpired, router, dispatch]);

  return null;
}
