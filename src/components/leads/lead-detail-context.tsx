"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";

interface LeadDetailContextValue {
  openLead: (id: string) => void;
  close: () => void;
  leadId: string | null;
  isOpen: boolean;
}

const LeadDetailContext = createContext<LeadDetailContextValue | null>(null);

export function LeadDetailProvider({ children }: { children: ReactNode }) {
  const [leadId, setLeadId] = useState<string | null>(null);

  const openLead = useCallback((id: string) => setLeadId(id), []);
  const close = useCallback(() => setLeadId(null), []);

  return (
    <LeadDetailContext.Provider
      value={{ openLead, close, leadId, isOpen: leadId !== null }}
    >
      {children}
      <LeadDetailSheet
        leadId={leadId}
        open={leadId !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    </LeadDetailContext.Provider>
  );
}

export function useLeadDetail() {
  const ctx = useContext(LeadDetailContext);
  if (!ctx) {
    throw new Error("useLeadDetail must be used within LeadDetailProvider");
  }
  return ctx;
}
