// Left sidebar shell shared by every student dashboard screen. Matches the mockups:
// logo, search with ⌘K, grouped nav (top / APPLICATION / FINANCE / SUPPORT), a
// "Need help?" card, and the user footer. Active item is derived from the pathname.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PieChart,
  BellRing,
  FileText,
  Clock,
  AlignLeft,
  Boxes,
  Wallet,
  LineChart,
  CircleDollarSign,
  Settings,
  UserRound,
  Search,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/useMe";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  heading?: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "MY Documents", href: "/documents", icon: PieChart },
      { label: "Notifications", href: "/notifications", icon: BellRing },
    ],
  },
  {
    heading: "APPLICATION",
    items: [
      { label: "My Application", href: "/application", icon: FileText },
      { label: "Credit Check", href: "/credit-check", icon: Clock },
      { label: "Loan Sanction", href: "/loan-sanction", icon: AlignLeft },
    ],
  },
  {
    heading: "FINANCE",
    items: [
      { label: "Lenders", href: "/lenders", icon: Boxes },
      { label: "Processing Fee", href: "/processing-fee", icon: Wallet },
      { label: "Disbursement", href: "/disbursement", icon: LineChart },
      { label: "EMI Planner", href: "/emi-planner", icon: CircleDollarSign },
    ],
  },
  {
    heading: "SUPPORT",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Profile", href: "/profile", icon: UserRound },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { me, displayName } = useMe();

  // Real student name/email with graceful fallbacks while loading.
  const name = displayName ?? "Your account";
  const email = me?.email ?? me?.phone ?? "";
  const initials = (displayName ?? "?")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col border-r border-border bg-base">
      {/* Logo */}
      <div className="px-6 pt-7">
        <Logo />
      </div>

      {/* Search */}
      <div className="px-5 py-5">
        <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-text-secondary">
          <Search size={16} />
          <span className="flex-1">Search</span>
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-secondary">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3">
        {NAV.map((section, si) => (
          <div key={si} className="mb-1">
            {section.heading ? (
              <p className="px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/70">
                {section.heading}
              </p>
            ) : null}
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-surface-2 font-medium text-text-primary"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  )}
                >
                  <Icon size={18} className={active ? "text-text-primary" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Need help card */}
      <div className="px-4 pb-3 pt-2">
        <div className="rounded-xl border border-brand/30 bg-brand/[0.04] p-4">
          <p className="text-sm font-semibold text-text-primary">Need help?</p>
          <p className="mt-1 text-[11px] leading-snug text-text-secondary">
            Our advisors are online Mon – Sat, 9 AM – 6 PM
          </p>
          <button className="btn-brand-gradient mt-3 w-full rounded-lg py-2 text-xs font-semibold text-black hover:brightness-110">
            Chat with Advisor
          </button>
        </div>
      </div>

      {/* User footer */}
      <div className="flex items-center gap-3 border-t border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">{name}</p>
          <p className="truncate text-xs text-text-secondary">{email}</p>
        </div>
        <MoreHorizontal size={18} className="text-text-secondary" />
      </div>
    </aside>
  );
}
