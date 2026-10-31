import { ImageResponse } from "next/og";
import { readableOn } from "@/features/appearance/color";
import { DEFAULT_THEME } from "@/features/appearance/theme";

/** Floppy-disk mark on a full-bleed background; the mark stays inside the maskable safe zone. */
export function appIcon(size: number) {
  const accent = DEFAULT_THEME.accent;
  const contrast = readableOn(accent);
  const mark = Math.round(size * 0.56);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: DEFAULT_THEME.background.color,
      }}
    >
      <svg width={mark} height={mark} viewBox="0 0 28 28">
        <path d="M5 3h14l4 4v18H5z" fill={accent} />
        <path d="M9 3v6h8V3" fill="none" stroke={contrast} strokeWidth="2" />
        <rect x="9" y="15" width="10" height="6" rx="1" fill={contrast} />
      </svg>
    </div>,
    { width: size, height: size },
  );
}
