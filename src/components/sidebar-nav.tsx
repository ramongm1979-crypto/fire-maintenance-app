"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, BookOpen, CalendarClock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/instalaciones", label: "Instalaciones", icon: Building2 },
  { href: "/manuales", label: "Manuales", icon: BookOpen },
  { href: "/calendario", label: "Calendario", icon: CalendarClock },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside data-slot="sidebar-nav" className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 sm:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-destructive text-white">
          <Flame className="size-5" />
        </div>
        <span className="font-semibold leading-tight">
          Mantenimiento
          <br />
          Incendios
        </span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => {
          const isActive =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
