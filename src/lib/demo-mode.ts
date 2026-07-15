import { isDemoModeEnabled } from "@/lib/env/public";

/** Client-safe: true only in explicit non-production demo opt-in. */
export function isDemoMode(): boolean {
  return isDemoModeEnabled();
}
