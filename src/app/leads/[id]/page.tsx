"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLeadDetail } from "@/components/leads/lead-detail-context";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { openLead } = useLeadDetail();

  useEffect(() => {
    router.replace("/leads");
    openLead(id);
  }, [id, router, openLead]);

  return null;
}
