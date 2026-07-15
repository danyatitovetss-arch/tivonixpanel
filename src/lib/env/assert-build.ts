/**
 * Build-time / config-time env checks (no server-only — safe for next.config).
 */
import {
  hasSupabasePublicConfig,
  isProductionRuntime,
} from "./public";

export function assertEnvForBuild(): void {
  const demoFlag = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (isProductionRuntime() && demoFlag) {
    throw new Error(
      "Build aborted: NEXT_PUBLIC_DEMO_MODE=true is forbidden when NODE_ENV=production"
    );
  }

  // During `next build`, NODE_ENV is production. Require public Supabase config.
  if (!hasSupabasePublicConfig()) {
    throw new Error(
      "Build aborted: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  if (isProductionRuntime() && !process.env.SUPABASE_SECRET_KEY?.trim()) {
    // Allow FRONTEND-only service that proxies API (secret lives on api service)
    if (process.env.APP_SERVICE === "frontend") return;
    throw new Error("Build aborted: SUPABASE_SECRET_KEY is required for production builds");
  }
}
