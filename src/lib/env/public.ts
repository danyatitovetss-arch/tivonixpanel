/**
 * Public/safe env helpers. Safe to import from client or middleware.
 * Demo mode is fail-closed: never active in production builds.
 */

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * DEMO_MODE is allowed only when ALL are true:
 * - NEXT_PUBLIC_DEMO_MODE === "true"
 * - NODE_ENV !== "production"
 * - ALLOW_DEMO_MODE === "true" (explicit opt-in)
 */
export function isDemoModeEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return false;
  if (isProductionRuntime()) return false;
  if (process.env.ALLOW_DEMO_MODE !== "true") return false;
  return true;
}

export function getSupabasePublicUrl(): string | undefined {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  return value || undefined;
}

export function getSupabasePublishableKey(): string | undefined {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  return value || undefined;
}

export function hasSupabasePublicConfig(): boolean {
  return Boolean(getSupabasePublicUrl() && getSupabasePublishableKey());
}

/** Safe internal redirect path (blocks open redirects). */
export function safeInternalPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return fallback;
  }
  if (next.includes("\\") || /%2f/i.test(next) || next.includes("@")) {
    return fallback;
  }
  return next;
}
