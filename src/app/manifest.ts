import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Backlog",
    short_name: "Backlog",
    description: "Diário pessoal de jogos",
    start_url: "/library",
    display: "standalone",
    background_color: "#121214",
    theme_color: "#121214",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
