"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ProspectDetailSheet } from "@/components/prospecting/prospect-detail-sheet";

interface ProspectDetailContextValue {
  openProspect: (id: string) => void;
  close: () => void;
  prospectId: string | null;
  isOpen: boolean;
}

const ProspectDetailContext = createContext<ProspectDetailContextValue | null>(null);

export function ProspectDetailProvider({ children }: { children: ReactNode }) {
  const [prospectId, setProspectId] = useState<string | null>(null);

  const openProspect = useCallback((id: string) => setProspectId(id), []);
  const close = useCallback(() => setProspectId(null), []);

  return (
    <ProspectDetailContext.Provider
      value={{ openProspect, close, prospectId, isOpen: prospectId !== null }}
    >
      {children}
      <ProspectDetailSheet
        prospectId={prospectId}
        open={prospectId !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    </ProspectDetailContext.Provider>
  );
}

export function useProspectDetail() {
  const ctx = useContext(ProspectDetailContext);
  if (!ctx) {
    throw new Error("useProspectDetail must be used within ProspectDetailProvider");
  }
  return ctx;
}
