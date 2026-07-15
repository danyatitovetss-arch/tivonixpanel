import { NextResponse } from "next/server";
import { collectServerEnvIssues } from "@/lib/env/server";

export async function GET() {
  const issues = collectServerEnvIssues();
  if (issues.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        service: process.env.APP_SERVICE ?? "full",
        error: "misconfigured",
        issues: issues.map((i) => i.code),
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    service: process.env.APP_SERVICE ?? "full",
  });
}
