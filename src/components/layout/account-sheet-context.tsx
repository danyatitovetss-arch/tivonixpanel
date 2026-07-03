"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AccountSheet } from "@/components/layout/account-sheet";

interface AccountSheetContextValue {
  openAccount: () => void;
  close: () => void;
  isOpen: boolean;
}

const AccountSheetContext = createContext<AccountSheetContextValue | null>(null);

export function AccountSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openAccount = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <AccountSheetContext.Provider value={{ openAccount, close, isOpen: open }}>
      {children}
      <AccountSheet open={open} onOpenChange={setOpen} />
    </AccountSheetContext.Provider>
  );
}

export function useAccountSheet() {
  const ctx = useContext(AccountSheetContext);
  if (!ctx) {
    throw new Error("useAccountSheet must be used within AccountSheetProvider");
  }
  return ctx;
}
