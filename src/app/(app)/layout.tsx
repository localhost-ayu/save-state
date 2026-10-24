import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";

const NAV = [
  { href: "/library", label: "Biblioteca" },
  { href: "/board", label: "Kanban" },
  { href: "/timeline", label: "Linha do tempo" },
  { href: "/settings", label: "Ajustes" },
] as const;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
          <Link href="/library" className="font-display font-semibold">
            Save State
          </Link>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted hover:bg-surface-raised hover:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <Button variant="ghost" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
