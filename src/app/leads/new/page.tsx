"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAddLeadSheet } from "@/components/leads/add-lead-context";

export default function NewLeadPage() {
  const router = useRouter();
  const { open } = useAddLeadSheet();

  useEffect(() => {
    router.replace("/leads");
    open();
  }, [router, open]);

  return null;
}
