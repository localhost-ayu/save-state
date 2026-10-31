import type { MetadataRoute } from "next";
import { DEFAULT_THEME } from "@/features/appearance/theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Save State",
    short_name: "Save State",
    description: "Diário pessoal de jogos: biblioteca, jornadas, reviews e memórias.",
    lang: "pt-BR",
    start_url: "/library",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: DEFAULT_THEME.background.color,
    theme_color: DEFAULT_THEME.background.color,
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Kanban", url: "/board" },
      { name: "Roleta", url: "/roulette" },
    ],
  };
}
