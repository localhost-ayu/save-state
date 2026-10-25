"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { href: "/library", label: "Biblioteca", icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { href: "/board", label: "Kanban", icon: "M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z" },
  { href: "/timeline", label: "Linha do tempo", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2" },
  {
    href: "/roulette",
    label: "Roleta",
    icon: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01",
  },
] as const;

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

function useCurrent() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

type IsCurrent = (href: string) => boolean;

const NONE: IsCurrent = () => false;

function DesktopLinks({ isCurrent }: { isCurrent: IsCurrent }) {
  return (
    <nav aria-label="Principal" className="hidden flex-1 gap-1 sm:flex">
      {SECTIONS.map((section) => {
        const current = isCurrent(section.href);
        return (
          <Link
            key={section.href}
            href={section.href as Route}
            aria-current={current ? "page" : undefined}
            className={cn(
              "relative flex h-11 items-center gap-2 rounded-control px-3 text-sm whitespace-nowrap hover:bg-surface-raised",
              current ? "font-semibold text-text" : "text-muted hover:text-text",
            )}
          >
            <Icon path={section.icon} className="size-[18px]" />
            {section.label}
            {current && (
              <span aria-hidden="true" className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SectionTitle({ isCurrent }: { isCurrent: IsCurrent }) {
  const section = SECTIONS.find((item) => isCurrent(item.href));
  return <span className="flex-1 font-display text-lg font-bold sm:hidden">{section?.label ?? "Save State"}</span>;
}

function BottomLinks({ isCurrent }: { isCurrent: IsCurrent }) {
  return (
    <nav
      aria-label="Principal"
      data-bottom-nav=""
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-x-0 border-b-0 surface px-1 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-text sm:hidden"
    >
      {SECTIONS.map((section) => {
        const current = isCurrent(section.href);
        return (
          <Link
            key={section.href}
            href={section.href as Route}
            aria-current={current ? "page" : undefined}
            className={cn(
              "flex min-h-13 flex-col items-center justify-center gap-1 text-[11px]",
              current ? "font-semibold text-text" : "text-muted",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-13 items-center justify-center rounded-pill",
                current && "bg-surface-raised ring-1 ring-border-strong",
              )}
            >
              <Icon path={section.icon} className="size-5" />
            </span>
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}

function DesktopNavLive() {
  return <DesktopLinks isCurrent={useCurrent()} />;
}

function SectionTitleLive() {
  return <SectionTitle isCurrent={useCurrent()} />;
}

function BottomNavLive() {
  return <BottomLinks isCurrent={useCurrent()} />;
}

export function DesktopNav() {
  return (
    <Suspense fallback={<DesktopLinks isCurrent={NONE} />}>
      <DesktopNavLive />
    </Suspense>
  );
}

export function MobileSectionTitle() {
  return (
    <Suspense fallback={<SectionTitle isCurrent={NONE} />}>
      <SectionTitleLive />
    </Suspense>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={<BottomLinks isCurrent={NONE} />}>
      <BottomNavLive />
    </Suspense>
  );
}
