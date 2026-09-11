"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface LoadingContextValue {
  /** True until the preloader has finished/been skipped. */
  isLoading: boolean;
  /** Called by the preloader once its exit sequence begins. */
  finishLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: false,
  finishLoading: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  const finishLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const value = useMemo(() => ({ isLoading, finishLoading }), [isLoading, finishLoading]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  return useContext(LoadingContext);
}
