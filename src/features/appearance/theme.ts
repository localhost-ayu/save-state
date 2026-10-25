import { z } from "zod";
import { isDark, mix, mutedOn, readableOn, rgba } from "./color";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const FONT_OPTIONS = {
  grotesk: { label: "Grotesca", heading: "var(--font-grotesk)", body: "var(--font-grotesk)" },
  rounded: { label: "Expressiva", heading: "var(--font-bricolage)", body: "var(--font-bricolage)" },
  editorial: { label: "Editorial", heading: "var(--font-serif)", body: "var(--font-inter)" },
  mono: { label: "Terminal", heading: "var(--font-mono)", body: "var(--font-mono)" },
} as const;

export type FontOption = keyof typeof FONT_OPTIONS;

export const themeSchema = z.object({
  accent: hex.default("#7FD1FF"),
  background: z
    .object({
      color: hex.default("#0E1020"),
      imagePath: z.string().nullable().default(null),
      dim: z.number().min(0).max(90).default(40),
      blur: z.number().min(0).max(24).default(0),
    })
    .prefault({}),
  surface: z
    .object({
      color: hex.default("#171A2E"),
      opacity: z.number().min(20).max(100).default(100),
      glass: z.boolean().default(false),
      blur: z.number().min(0).max(40).default(16),
    })
    .prefault({}),
  radius: z.number().min(0).max(28).default(14),
  font: z.enum(Object.keys(FONT_OPTIONS) as [FontOption, ...FontOption[]]).default("grotesk"),
});

export type Theme = z.infer<typeof themeSchema>;

export const DEFAULT_THEME: Theme = themeSchema.parse({});

export function parseTheme(value: unknown): Theme {
  const result = themeSchema.safeParse(value ?? {});
  return result.success ? result.data : DEFAULT_THEME;
}

export function themeToCssVars(theme: Theme): Record<string, string> {
  const base = theme.background.color;
  const surface = theme.surface.color;
  const text = readableOn(surface);
  const dark = isDark(surface);
  const raised = mix(surface, text, dark ? 0.08 : 0.06);
  const border = mix(surface, text, dark ? 0.16 : 0.14);
  const font = FONT_OPTIONS[theme.font];
  const alpha = theme.surface.opacity / 100;

  return {
    "--background": base,
    "--page-text": readableOn(base),
    "--surface": rgba(surface, alpha),
    "--surface-solid": surface,
    "--surface-raised": rgba(raised, Math.min(1, alpha + 0.05)),
    "--border": rgba(border, Math.max(0.6, alpha)),
    "--text": text,
    "--text-muted": mutedOn(surface, text),
    "--accent": theme.accent,
    "--accent-contrast": readableOn(theme.accent),
    "--card-radius": `${theme.radius}px`,
    "--glass-blur": theme.surface.glass ? `${theme.surface.blur}px` : "0px",
    "--bg-dim": String(theme.background.dim / 100),
    "--bg-blur": `${theme.background.blur}px`,
    "--font-heading": font.heading,
    "--font-body": font.body,
    "color-scheme": dark ? "dark" : "light",
  };
}

export function cssVarsToRule(vars: Record<string, string>, selector = ":root") {
  return `${selector}{${Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";")}}`;
}
