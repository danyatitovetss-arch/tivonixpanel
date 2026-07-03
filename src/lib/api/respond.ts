import { NextResponse } from "next/server";
import { toUserMessage } from "@/lib/errors";

export function apiErrorResponse(error: unknown, status: number) {
  return NextResponse.json({ error: toUserMessage(error) }, { status });
}
