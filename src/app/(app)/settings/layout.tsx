import Link from "next/link";

const TABS = [
  { href: "/settings/profile", label: "Perfil" },
  { href: "/settings/appearance", label: "Aparência" },
] as const;

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Ajustes</h1>
        <nav aria-label="Ajustes" className="flex gap-1 rounded-control surface p-1 text-text">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-control px-4 py-2 text-sm text-muted hover:bg-surface-raised hover:text-text"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
