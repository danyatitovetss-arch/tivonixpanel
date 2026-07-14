import "server-only";

/**
 * Canonical public site origin for Auth email redirects and absolute links.
 * Prefer APP_URL / NEXT_PUBLIC_APP_URL over request.url (Railway internal hosts).
 */
export function getPublicAppOrigin(request?: Request): string {
  const fromEnv =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* fall through */
    }
  }

  if (request) {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
      || request.headers.get("host")?.trim();
    if (host && !/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) {
      return `${proto === "http" ? "http" : "https"}://${host}`;
    }
    try {
      return new URL(request.url).origin;
    } catch {
      /* fall through */
    }
  }

  return "http://localhost:3000";
}
