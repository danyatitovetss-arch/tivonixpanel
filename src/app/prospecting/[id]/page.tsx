"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProspectDetail } from "@/components/prospecting/prospect-detail-context";

export default function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { openProspect } = useProspectDetail();

  useEffect(() => {
    router.replace("/prospecting");
    openProspect(id);
  }, [id, router, openProspect]);

  return null;
}
