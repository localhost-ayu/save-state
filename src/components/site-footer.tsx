import Link from "next/link";
import { LEGAL } from "@/lib/legal";

const linkClass = "text-page underline underline-offset-2 hover:text-accent-text";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-6">
      <div className="flex flex-col gap-2 rounded-control scrim px-4 py-3 text-xs leading-relaxed text-page-muted">
        <p>
          {LEGAL.productName} · por{" "}
          <a href={LEGAL.authorUrl} className={linkClass}>
            {LEGAL.author} ({LEGAL.handle})
          </a>{" "}
          · Dados de jogos fornecidos por{" "}
          <a href="https://www.igdb.com" className={linkClass}>
            IGDB.com
          </a>
        </p>
        <p>
          Projeto pessoal e não comercial, sem afiliação com Sony, Nintendo, Microsoft, Valve, IGDB, Twitch ou com as
          publishers dos jogos. Nomes, capas e marcas pertencem aos respectivos donos.
        </p>
        <nav aria-label="Links legais" className="flex flex-wrap gap-4">
          <Link href="/termos" className={linkClass}>
            Termos de uso
          </Link>
          <Link href="/privacidade" className={linkClass}>
            Privacidade
          </Link>
          <a href={`mailto:${LEGAL.contactEmail}`} className={linkClass}>
            Contato
          </a>
        </nav>
      </div>
    </footer>
  );
}
