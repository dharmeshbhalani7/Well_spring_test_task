"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { hydrateAuth } from "@/modules/auth/store/actions";
import { SessionExpiredListener } from "@/modules/auth/components/SessionExpiredListener";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return (
    <Provider store={store}>
      <SessionExpiredListener />
      {children}
    </Provider>
  );
}
