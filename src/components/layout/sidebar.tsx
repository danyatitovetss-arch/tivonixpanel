"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Handshake,
  Wallet,
  Settings,
  List,
  LogOut,
  FileBarChart,
  User,
  BookOpen,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/store";
import { canAccessResource } from "@/lib/access";
import { getUserRoleLabel } from "@/lib/statuses";
import { isDemoMode } from "@/lib/demo-mode";
import { logoutApi } from "@/lib/store-api-bridge";
import { RoleSwitcher } from "./role-switcher";
import { useAccountSheet } from "./account-sheet-context";
import { useIsBootstrapping } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import type { AccessResource } from "@/lib/types";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  resource?: AccessResource;
  partnerOnly?: boolean;
}[] = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/my", label: "Мой кабинет", icon: User, partnerOnly: true },
  { href: "/leads", label: "Клиенты", icon: List, resource: "leads" },
  { href: "/prospecting", label: "Поиск клиентов", icon: ListChecks, resource: "prospecting", partnerOnly: true },
  { href: "/academy", label: "Как искать клиентов", icon: BookOpen, partnerOnly: true },
  { href: "/partners", label: "Партнёры", icon: Users, resource: "partners" },
  { href: "/deals", label: "Сделки", icon: Handshake, resource: "deals" },
  { href: "/payouts", label: "Выплаты", icon: Wallet, resource: "payouts" },
  { href: "/reports", label: "Отчёты", icon: FileBarChart, resource: "reports" },
  { href: "/settings", label: "Настройки", icon: Settings, resource: "settings" },
  { href: "/admin/legal-profiles", label: "Юр. профили", icon: Users, resource: "admin" },
  { href: "/admin/audit-logs", label: "Журнал действий", icon: FileBarChart, resource: "admin" },
];

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const { openAccount } = useAccountSheet();
  const isBootstrapping = useIsBootstrapping();

  const visibleItems = navItems.filter((item) => {
    if (item.partnerOnly && user.role !== "partner") return false;
    if (item.href === "/my" && user.role !== "partner") return false;
    if (item.resource && !canAccessResource(user, item.resource)) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col bg-[#050505] text-white lg:w-60 xl:w-64",
        className
      )}
    >
      <div className="px-6 py-7">
        <Link href={user.role === "partner" ? "/my" : "/dashboard"} onClick={onNavigate} className="block">
          <Image
            src="/images/white-Photoroom.png"
            alt="TIVONIX Partners CRM"
            width={320}
            height={120}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/leads" && pathname.startsWith("/leads/") && pathname !== "/leads/new") ||
            (item.href === "/partners" && pathname.startsWith("/partners/")) ||
            (item.href === "/academy" && pathname.startsWith("/academy")) ||
            (item.href === "/prospecting" && pathname.startsWith("/prospecting"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <RoleSwitcher />

      <div className="px-3 pb-4">
        <div className="rounded-xl bg-white/5 px-3 py-3">
          {isBootstrapping ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-white/10" />
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
              <Skeleton className="h-4 w-14 bg-white/10" />
            </div>
          ) : (
            <>
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                openAccount();
              }}
              className="min-w-0 flex-1 text-left transition-opacity hover:opacity-90"
            >
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="mt-0.5 text-xs text-white/50">{getUserRoleLabel(user.role)}</p>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                openAccount();
              }}
              title="Настройки"
              aria-label="Настройки"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Settings className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              onNavigate?.();
              if (!isDemoMode()) {
                await logoutApi();
              }
              window.location.href = "/login";
            }}
            className="mt-3 inline-flex items-center gap-2 text-sm text-[#ef4444] transition-colors hover:text-[#f87171]"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            Выйти
          </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
