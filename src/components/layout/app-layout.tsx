"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { AppPageSkeleton, type AppPageSkeletonVariant } from "./app-page-skeleton";
import { useApp, useIsBootstrapping } from "@/lib/store";
import { isDemoMode } from "@/lib/demo-mode";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  showAddLead?: boolean;
  showSearch?: boolean;
  skeletonVariant?: AppPageSkeletonVariant;
}

function skeletonVariantForPath(pathname: string): AppPageSkeletonVariant {
  if (pathname.startsWith("/dashboard")) return "stats";
  if (pathname.startsWith("/academy")) return "academy";
  if (pathname.startsWith("/reports") || pathname.startsWith("/settings")) return "simple";
  return "table";
}

export function AppLayout({
  children,
  title,
  showAddLead = true,
  showSearch = true,
  skeletonVariant,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isBootstrapping = useIsBootstrapping();
  const { refreshFromServer } = useApp();
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const variant = skeletonVariant ?? skeletonVariantForPath(pathname);

  useEffect(() => {
    if (isDemoMode() || isBootstrapping) return;
    if (prevPathRef.current !== null && prevPathRef.current !== pathname) {
      void refreshFromServer();
    }
    prevPathRef.current = pathname;
  }, [pathname, isBootstrapping, refreshFromServer]);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden lg:block">
        <Sidebar className="fixed inset-y-0 left-0 z-40" />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-64 border-none bg-[#050505] p-0">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60 xl:pl-64">
        <Topbar
          title={title}
          onMenuClick={() => setMobileOpen(true)}
          showAddLead={showAddLead && !isBootstrapping}
          showSearch={showSearch && !isBootstrapping}
          isLoading={isBootstrapping}
        />
        <main className="min-w-0 flex-1 overflow-x-auto px-4 py-6 md:px-6 lg:px-8">
          {isBootstrapping ? <AppPageSkeleton variant={variant} /> : children}
        </main>
      </div>
    </div>
  );
}
