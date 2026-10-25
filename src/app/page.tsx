import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Seu diário de jogos.</h1>
      <p className="text-lg text-muted">
        Biblioteca, progresso, linha do tempo e as memórias de cada jogo, num lugar só.
      </p>
      <div>
        <Link
          href="/library"
          className="inline-flex h-11 items-center rounded-control bg-accent-fill px-5 font-medium text-accent-fill-contrast"
        >
          Abrir biblioteca
        </Link>
      </div>
    </main>
  );
}
