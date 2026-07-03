"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AddLeadSheet } from "@/components/leads/add-lead-sheet";

interface AddLeadContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const AddLeadContext = createContext<AddLeadContextValue | null>(null);

export function AddLeadProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AddLeadContext.Provider value={{ open, close, isOpen }}>
      {children}
      <AddLeadSheet open={isOpen} onOpenChange={setIsOpen} />
    </AddLeadContext.Provider>
  );
}

export function useAddLeadSheet() {
  const ctx = useContext(AddLeadContext);
  if (!ctx) {
    throw new Error("useAddLeadSheet must be used within AddLeadProvider");
  }
  return ctx;
}

/** Безопасный хук — если провайдера нет, возвращает no-op */
export function useAddLeadSheetOptional() {
  return useContext(AddLeadContext);
}
