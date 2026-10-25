export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function mix(a: string, b: string, weight: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex({
    r: x.r + (y.r - x.r) * weight,
    g: x.g + (y.g - x.g) * weight,
    b: x.b + (y.b - x.b) * weight,
  });
}

export function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isDark(hex: string) {
  return luminance(hex) < 0.18;
}

export function readableOn(background: string) {
  const best = ["#FFFFFF", "#0E1020"].sort((a, b) => contrastRatio(b, background) - contrastRatio(a, background))[0];
  if (contrastRatio(best, background) >= 4.5) return best;
  return contrastRatio("#000000", background) > contrastRatio(best, background) ? "#000000" : best;
}

export function mutedOn(background: string, text: string) {
  for (let weight = 0.35; weight > 0; weight -= 0.05) {
    const candidate = mix(text, background, weight);
    if (contrastRatio(candidate, background) >= 4.5) return candidate;
  }
  return text;
}

export type Hsl = { h: number; s: number; l: number };

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s, l };
}

export function hslToHex({ h, s, l }: Hsl) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
}

export function adjustUntil(color: string, direction: 1 | -1, passes: (candidate: string) => boolean) {
  if (passes(color)) return color;
  const hsl = hexToHsl(color);
  for (let step = 0; step <= 100; step++) {
    const candidate = hslToHex({ ...hsl, l: Math.min(1, Math.max(0, hsl.l + direction * step * 0.01)) });
    if (passes(candidate)) return candidate;
  }
  return direction > 0 ? "#FFFFFF" : "#000000";
}

export function isWarmSaturated(hex: string) {
  const { h, s } = hexToHsl(hex);
  return (h < 40 || h > 330) && s > 0.6;
}

export type Hsv = { h: number; s: number; v: number };

export function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const d = max - Math.min(R, G, B);
  let h = 0;
  if (d) {
    h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export function hsvToHex({ h, s, v }: Hsv) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return rgbToHex({ r: f(5), g: f(3), b: f(1) }).toUpperCase();
}

export function formatRatio(ratio: number) {
  return `${ratio.toFixed(1).replace(".", ",")}:1`;
}
