import { z } from "zod";
import { adjustUntil, contrastRatio, isDark, isWarmSaturated, mix, mutedOn, readableOn, rgba } from "./color";

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
  recentColors: z.array(hex).max(6).default([]),
});

export type Theme = z.infer<typeof themeSchema>;

export const DEFAULT_THEME: Theme = themeSchema.parse({});

export function parseTheme(value: unknown): Theme {
  const result = themeSchema.safeParse(value ?? {});
  return result.success ? result.data : DEFAULT_THEME;
}

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const DARK_TEXT = "#0E1020";
const MIN_SCRIM = 0.62;

/** Accent as a button fill: prefers white text on warm saturated hues and shifts lightness until text reaches 5:1. */
export function accentFill(accent: string) {
  const preferWhite = isWarmSaturated(accent) || contrastRatio(accent, WHITE) >= contrastRatio(accent, DARK_TEXT);
  const text = preferWhite ? WHITE : DARK_TEXT;
  const fill = adjustUntil(accent, preferWhite ? -1 : 1, (candidate) => contrastRatio(candidate, text) >= 5);
  return { fill, text };
}

/** Surface composited over the worst backdrops it can sit on. */
function surfaceBackdrops(theme: Theme) {
  const alpha = theme.surface.opacity / 100;
  const over = (backdrop: string) => mix(backdrop, theme.surface.color, alpha);
  return theme.background.imagePath ? [over(BLACK), over(WHITE)] : [over(theme.background.color)];
}

function minContrast(color: string, backdrops: string[]) {
  return Math.min(...backdrops.map((backdrop) => contrastRatio(color, backdrop)));
}

/** Lowest card opacity (in %) that keeps card text at 4.5:1 over any backdrop, or null when the current one passes. */
export function minimumSurfaceOpacity(theme: Theme) {
  const text = readableOn(theme.surface.color);
  if (minContrast(text, surfaceBackdrops(theme)) >= 4.5) return null;
  for (let opacity = theme.surface.opacity; opacity <= 100; opacity++) {
    if (minContrast(text, surfaceBackdrops({ ...theme, surface: { ...theme.surface, opacity } })) >= 4.5)
      return opacity;
  }
  return 100;
}

/** Scrim behind small text on the page: transparent without an image, otherwise the background color raised until page text passes. */
function pageScrim(theme: Theme, pageText: string) {
  if (!theme.background.imagePath) return { scrim: "transparent", backdrops: [theme.background.color], alpha: 0 };
  for (let alpha = MIN_SCRIM; alpha <= 1; alpha += 0.02) {
    const backdrops = [mix(BLACK, theme.background.color, alpha), mix(WHITE, theme.background.color, alpha)];
    if (minContrast(pageText, backdrops) >= 4.5)
      return { scrim: rgba(theme.background.color, alpha), backdrops, alpha };
  }
  return { scrim: theme.background.color, backdrops: [theme.background.color], alpha: 1 };
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

  const pageText = readableOn(base);
  const scrim = pageScrim(theme, pageText);
  const pageMuted = mutedAgainst(pageText, scrim.backdrops);

  const backdrops = surfaceBackdrops(theme);
  const fill = accentFill(theme.accent);
  const accentText = adjustUntil(theme.accent, dark ? 1 : -1, (candidate) => minContrast(candidate, backdrops) >= 4.5);
  const borderStrong = strongBorder(surface, text);
  const focusRing = minContrast(accentText, [base, ...backdrops]) >= 3 ? accentText : pageText;

  return {
    "--background": base,
    "--page-text": pageText,
    "--page-muted": pageMuted,
    "--page-scrim": scrim.scrim,
    "--scrim-blur": theme.background.imagePath ? "12px" : "0px",
    "--surface": rgba(surface, alpha),
    "--surface-solid": surface,
    "--surface-raised": rgba(raised, Math.min(1, alpha + 0.05)),
    "--border": rgba(border, Math.max(0.6, alpha)),
    "--border-strong": borderStrong,
    "--text": text,
    "--text-muted": mutedOn(surface, text),
    "--accent": theme.accent,
    "--accent-contrast": readableOn(theme.accent),
    "--accent-fill": fill.fill,
    "--accent-fill-contrast": fill.text,
    "--accent-text": accentText,
    "--focus-ring": focusRing,
    "--card-radius": `${theme.radius}px`,
    "--glass-blur": theme.surface.glass ? `${theme.surface.blur}px` : "0px",
    "--bg-dim": String(theme.background.dim / 100),
    "--bg-blur": `${theme.background.blur}px`,
    "--font-heading": font.heading,
    "--font-body": font.body,
    "color-scheme": dark ? "dark" : "light",
  };
}

function mutedAgainst(textColor: string, backdrops: string[]) {
  for (let weight = 0.35; weight > 0; weight -= 0.05) {
    const candidate = mix(textColor, backdrops[0], weight);
    if (minContrast(candidate, backdrops) >= 4.5) return candidate;
  }
  return textColor;
}

function strongBorder(surface: string, text: string) {
  for (let weight = 0.3; weight <= 1; weight += 0.05) {
    const candidate = mix(surface, text, weight);
    if (contrastRatio(candidate, surface) >= 3) return candidate;
  }
  return text;
}

export function cssVarsToRule(vars: Record<string, string>, selector = ":root") {
  return `${selector}{${Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";")}}`;
}
