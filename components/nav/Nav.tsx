"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Activity,
  BarChart3,
  Bookmark,
  CheckSquare,
  Users,
  Calendar,
  Lightbulb,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Sun, badge: 4 },
  { href: "/what-changed", label: "What Changed", icon: Activity, badge: 5 },
  { href: "/pipeline", label: "Pipeline", icon: BarChart3, badge: null },
  { href: "/saved-deals", label: "Saved Deals", icon: Bookmark, badge: 4 },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, badge: 6 },
  { href: "/team", label: "Team", icon: Users, badge: null },
  { href: "/meetings", label: "Meetings", icon: Calendar, badge: 4 },
  { href: "/insights", label: "Insights", icon: Lightbulb, badge: 3 },
];

function NavItem({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
        active
          ? "bg-accent-muted text-accent-bright"
          : "text-ink-2 hover:text-ink-1 hover:bg-white/[0.04]"
      )}
    >
      <item.icon
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-colors",
          active ? "text-accent-bright" : "text-ink-3 group-hover:text-ink-2"
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge !== null && (
        <span
          className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
            active
              ? "bg-accent/30 text-accent-bright"
              : "bg-white/[0.06] text-ink-3 group-hover:text-ink-2"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-bg-base/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-ink-1">VP OS</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-ink-2 hover:text-ink-1 hover:bg-white/[0.06] transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in nav */}
      <div
        className={cn(
          "fixed top-14 left-0 bottom-0 z-40 w-72 lg:hidden bg-bg-surface border-r border-border transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-bg-surface border-r border-border h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-atlas flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-ink-1 leading-none">VP OS</div>
              <div className="text-[10px] text-ink-3 mt-0.5">Kyle Athans</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Integration status */}
        <div className="p-3 border-t border-border">
          <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-wider px-2 mb-2">
            Integrations
          </div>
          <div className="flex flex-col gap-1">
            {["HubSpot", "Granola", "Calendar"].map((name) => (
              <div key={name} className="flex items-center gap-2 px-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-ink-4" />
                <span className="text-xs text-ink-3">{name}</span>
                <span className="ml-auto text-[10px] text-ink-4">off</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
