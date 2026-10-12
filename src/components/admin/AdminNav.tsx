"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/projects", label: "Projects", exact: false },
  { href: "/admin/skills", label: "Skills", exact: false },
  { href: "/admin/stats", label: "Stats", exact: false },
  { href: "/admin/profile", label: "Profile", exact: false },
  { href: "/admin/messages", label: "Messages", exact: false },
] as const;

/**
 * The admin section switcher. Client-side only so the current section can be
 * highlighted; the links themselves are plain navigations.
 */
export function AdminNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn("relative", 
              "brutal-pill brutal-border px-3.5 py-1.5 text-sm font-extrabold tracking-tight",
              "transition-colors duration-150",
              active ? "bg-accent text-accent-ink" : "bg-surface hover:bg-peach",
            )}
          >
            {link.label}{link.href === "/admin/messages" && unreadCount > 0 ? ( <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent" /> ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
