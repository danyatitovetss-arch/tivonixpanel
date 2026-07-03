import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/respond";
import {
  getLegalDocumentBySlug,
  SLUG_TO_TYPE,
} from "@/lib/legal-documents-content";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { slug } = await context.params;
  const docType = SLUG_TO_TYPE[slug];
  const staticDoc = getLegalDocumentBySlug(slug);

  if (!docType || !staticDoc) {
    return NextResponse.json({ error: "Документ не найден" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_documents")
    .select("version, published_at, status")
    .eq("type", docType)
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return apiErrorResponse(error.message, 500);

  return NextResponse.json({
    data: {
      type: staticDoc.type,
      title: staticDoc.title,
      version: data?.version ?? staticDoc.version,
      content: staticDoc.content,
      published_at: data?.published_at ?? null,
      status: data?.status ?? "active",
    },
  });
}
