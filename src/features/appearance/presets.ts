import { DEFAULT_THEME, parseTheme, type Theme } from "./theme";

export const THEME_PRESETS: Array<{ id: string; label: string; theme: Theme }> = [
  { id: "memory-card", label: "Memory Card", theme: DEFAULT_THEME },
  {
    id: "vitrine",
    label: "Vitrine",
    theme: parseTheme({
      accent: "#FF8FC8",
      background: { color: "#16101C" },
      surface: { color: "#241A2E" },
      radius: 24,
      font: "rounded",
    }),
  },
  {
    id: "vidro",
    label: "Vidro",
    theme: parseTheme({
      accent: "#A9C7FF",
      background: { color: "#101826", dim: 35, blur: 6 },
      surface: { color: "#1C2638", opacity: 55, glass: true, blur: 22 },
      radius: 20,
    }),
  },
  {
    id: "papel",
    label: "Papel",
    theme: parseTheme({
      accent: "#1F2A44",
      background: { color: "#F4F1EA" },
      surface: { color: "#FFFFFF" },
      radius: 4,
      font: "editorial",
    }),
  },
  {
    id: "terminal",
    label: "Terminal",
    theme: parseTheme({
      accent: "#7DE3B0",
      background: { color: "#0A0F0C" },
      surface: { color: "#111A15" },
      radius: 0,
      font: "mono",
    }),
  },
];
