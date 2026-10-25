import { mediaUrl } from "@/lib/media";
import { rgba } from "../color";
import { cssVarsToRule, themeToCssVars, type Theme } from "../theme";

export function ThemeStyle({ theme }: { theme: Theme }) {
  return <style>{cssVarsToRule(themeToCssVars(theme))}</style>;
}

export function ThemeBackdrop({ theme, src }: { theme: Theme; src?: string }) {
  const imageSrc = src ?? (theme.background.imagePath ? mediaUrl(theme.background.imagePath) : null);
  if (!imageSrc) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        className="size-full scale-110 object-cover"
        style={{ filter: `blur(${theme.background.blur}px)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: rgba(theme.background.color, theme.background.dim / 100) }}
      />
    </div>
  );
}
