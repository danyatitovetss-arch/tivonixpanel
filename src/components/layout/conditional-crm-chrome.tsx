/**
 * Heavy CRM sheet providers — loaded only outside public auth surfaces.
 */
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AddLeadProvider } from "@/components/leads/add-lead-context";
import { LeadDetailProvider } from "@/components/leads/lead-detail-context";
import { ProspectDetailProvider } from "@/components/prospecting/prospect-detail-context";
import { AccountSheetProvider } from "@/components/layout/account-sheet-context";
import { GlobalAnnouncementHost } from "@/components/layout/global-announcement-host";

function isPublicAuthSurface(pathname: string | null): boolean {
  if (!pathname) return true;
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/legal/") ||
    pathname.startsWith("/auth/")
  );
}

export function ConditionalCrmChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isPublicAuthSurface(pathname)) {
    return <>{children}</>;
  }

  return (
    <AddLeadProvider>
      <LeadDetailProvider>
        <ProspectDetailProvider>
          <AccountSheetProvider>
            {children}
            <GlobalAnnouncementHost />
          </AccountSheetProvider>
        </ProspectDetailProvider>
      </LeadDetailProvider>
    </AddLeadProvider>
  );
}
