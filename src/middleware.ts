import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/blocked",
  "/legal/privacy",
  "/legal/terms",
  "/legal/personal-data-consent",
  "/legal/partner-agreement",
  "/legal/commission-rules",
  "/legal/cookies",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/academy",
  "/prospecting",
  "/leads",
  "/deals",
  "/partners",
  "/payouts",
  "/reports",
  "/settings",
  "/admin",
  "/my",
  "/onboarding",
];

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const API_ONLY = process.env.APP_SERVICE === "api";

function isApiOnlyBlocked(pathname: string) {
  if (!API_ONLY) return false;
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) return false;
  if (pathname === "/login" || pathname === "/favicon.ico") return false;
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)) return false;
  return true;
}

function isPublic(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isApiOnlyBlocked(pathname)) {
    return NextResponse.json({ error: "API service" }, { status: 404 });
  }

  if (DEMO_MODE) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
    return updateSession(request);
  }

  if (isPublic(pathname)) {
    return updateSession(request);
  }

  if (!isProtected(pathname)) {
    return updateSession(request);
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.next();
  }

  let response = await updateSession(request);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const forbidden = request.nextUrl.clone();
      forbidden.pathname = "/dashboard";
      forbidden.searchParams.set("error", "forbidden");
      return NextResponse.redirect(forbidden);
    }
  }

  if (
    isProtected(pathname) &&
    !pathname.startsWith("/blocked")
  ) {
    const { data: legal } = await supabase
      .from("user_legal_profiles")
      .select("crm_access, onboarding_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (legal?.onboarding_status === "blocked_under_16") {
      const blocked = request.nextUrl.clone();
      blocked.pathname = "/blocked";
      return NextResponse.redirect(blocked);
    }

    const needsOnboarding =
      !legal ||
      legal.onboarding_status === "not_started" ||
      legal.onboarding_status === "in_progress" ||
      legal.onboarding_status === "requires_reaccept" ||
      !legal.crm_access;

    const mustChangePassword = user.user_metadata?.must_change_password === true;

    if (needsOnboarding) {
      if (!pathname.startsWith("/onboarding/legal")) {
        const onboarding = request.nextUrl.clone();
        onboarding.pathname = "/onboarding/legal";
        return NextResponse.redirect(onboarding);
      }
      return response;
    }

    if (mustChangePassword) {
      if (!pathname.startsWith("/onboarding/set-password")) {
        const setPassword = request.nextUrl.clone();
        setPassword.pathname = "/onboarding/set-password";
        return NextResponse.redirect(setPassword);
      }
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
