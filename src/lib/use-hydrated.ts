"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true côté client après hydratation (évite les écarts SSR / localStorage). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
