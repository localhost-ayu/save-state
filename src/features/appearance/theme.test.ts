import { describe, expect, it } from "vitest";
import { contrastRatio } from "./color";
import { DEFAULT_THEME, accentFill, minimumSurfaceOpacity, parseTheme, themeToCssVars } from "./theme";

describe("parseTheme", () => {
  it("fills defaults from the Memory Card direction", () => {
    expect(parseTheme({})).toEqual(DEFAULT_THEME);
    expect(DEFAULT_THEME.background.color).toBe("#0E1020");
    expect(DEFAULT_THEME.radius).toBe(14);
  });

  it("keeps valid partial overrides", () => {
    const theme = parseTheme({ accent: "#FF8FC8", surface: { glass: true } });
    expect(theme.accent).toBe("#FF8FC8");
    expect(theme.surface.glass).toBe(true);
    expect(theme.surface.color).toBe("#171A2E");
  });

  it("falls back to defaults on invalid data", () => {
    expect(parseTheme({ accent: "pink", radius: 99 })).toEqual(DEFAULT_THEME);
    expect(parseTheme(null)).toEqual(DEFAULT_THEME);
  });
});

describe("themeToCssVars", () => {
  it.each(["#171A2E", "#FFFFFF", "#F5D547", "#3A1D5C", "#777777"])("keeps text readable on %s", (color) => {
    const vars = themeToCssVars(parseTheme({ surface: { color } }));
    expect(contrastRatio(vars["--text"], color)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(vars["--text-muted"], color)).toBeGreaterThanOrEqual(4.5);
  });

  it("picks a readable color on the accent", () => {
    const vars = themeToCssVars(parseTheme({ accent: "#F5D547" }));
    expect(contrastRatio(vars["--accent-contrast"], "#F5D547")).toBeGreaterThanOrEqual(4.5);
  });

  it("only blurs when glass is on", () => {
    expect(themeToCssVars(DEFAULT_THEME)["--glass-blur"]).toBe("0px");
    expect(themeToCssVars(parseTheme({ surface: { glass: true, blur: 20 } }))["--glass-blur"]).toBe("20px");
  });

  it("supports square corners", () => {
    expect(themeToCssVars(parseTheme({ radius: 0 }))["--card-radius"]).toBe("0px");
  });
});

describe("design tokens", () => {
  const userTheme = parseTheme({
    accent: "#F90000",
    background: { color: "#101826", imagePath: "u/backgrounds/x.webp", dim: 20, blur: 6 },
    surface: { color: "#1C2638", opacity: 55, glass: true, blur: 22 },
    radius: 20,
  });

  it("fills warm accents with white text at 5:1 or more", () => {
    const { fill, text } = accentFill("#F90000");
    expect(text).toBe("#FFFFFF");
    expect(contrastRatio(fill, text)).toBeGreaterThanOrEqual(5);
  });

  it("keeps dark text on light accents", () => {
    const { fill, text } = accentFill("#7FD1FF");
    expect(text).toBe("#0E1020");
    expect(fill).toBe("#7FD1FF");
  });

  it.each([
    ["default", DEFAULT_THEME],
    ["user", userTheme],
    ["paper", parseTheme({ accent: "#1F2A44", background: { color: "#F4F1EA" }, surface: { color: "#FFFFFF" } })],
  ])("keeps accent text readable on cards in the %s theme", (_, theme) => {
    const vars = themeToCssVars(theme);
    expect(contrastRatio(vars["--accent-text"], theme.surface.color)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(vars["--border-strong"], theme.surface.color)).toBeGreaterThanOrEqual(3);
  });

  it("adds a scrim only when there is a background image", () => {
    expect(themeToCssVars(DEFAULT_THEME)["--page-scrim"]).toBe("transparent");
    expect(themeToCssVars(userTheme)["--page-scrim"]).toMatch(/^rgba\(16, 24, 38, 0\.\d+\)$/);
  });

  it("suggests a minimum card opacity when translucent cards fail over an image", () => {
    const light = parseTheme({ background: { imagePath: "x" }, surface: { color: "#FFFFFF", opacity: 30 } });
    expect(minimumSurfaceOpacity(light)).toBeGreaterThan(30);
    expect(minimumSurfaceOpacity(DEFAULT_THEME)).toBeNull();
  });
});
