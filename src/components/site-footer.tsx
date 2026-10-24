import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted">
        <p>
          {LEGAL.productName} · por{" "}
          <a href={LEGAL.authorUrl} className="underline hover:text-text">
            {LEGAL.author} ({LEGAL.handle})
          </a>{" "}
          · Dados de jogos fornecidos por{" "}
          <a href="https://www.igdb.com" className="underline hover:text-text">
            IGDB.com
          </a>
        </p>
        <p>
          Projeto pessoal e não comercial, sem afiliação com Sony, Nintendo, Microsoft, Valve, IGDB, Twitch ou com as
          publishers dos jogos. Nomes, capas e marcas pertencem aos respectivos donos.
        </p>
        <nav aria-label="Links legais" className="flex gap-4">
          <Link href="/termos" className="underline hover:text-text">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="underline hover:text-text">
            Privacidade
          </Link>
          <a href={`mailto:${LEGAL.contactEmail}`} className="underline hover:text-text">
            Contato
          </a>
        </nav>
      </div>
    </footer>
  );
}
