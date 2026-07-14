import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicAppOrigin } from "@/lib/app-url";

function safeInternalPath(next: string | null, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return fallback;
  }
  if (next.includes("\\") || next.includes("%2f") || next.includes("%2F")) {
    return fallback;
  }
  return next;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getPublicAppOrigin(request);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/pending");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
