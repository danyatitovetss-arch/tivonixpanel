import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicAppOrigin } from "@/lib/app-url";
import { safeInternalPath } from "@/lib/env/public";

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
