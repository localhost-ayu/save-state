import { describe, expect, it } from "vitest";
import { contrastRatio } from "./color";
import { DEFAULT_THEME, parseTheme, themeToCssVars } from "./theme";

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
