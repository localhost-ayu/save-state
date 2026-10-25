"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ImageCropDialog } from "@/features/media/components/image-crop-dialog";
import { removeMedia, uploadMedia } from "@/features/media/image";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";
import { saveTheme } from "../actions";
import { THEME_PRESETS } from "../presets";
import { contrastRatio, mix, readableOn } from "../color";
import {
  DEFAULT_THEME,
  FONT_OPTIONS,
  accentFill,
  cssVarsToRule,
  minimumSurfaceOpacity,
  themeToCssVars,
  type FontOption,
  type Theme,
} from "../theme";
import { ColorPicker, type ContrastCheck } from "./color-picker";
import { ThemeBackdrop } from "./theme-style";

const LIVE_STYLE_ID = "theme-live-preview";
const RADIUS_PRESETS = [
  { label: "Reto", value: 0 },
  { label: "Suave", value: 8 },
  { label: "Padrão", value: 14 },
  { label: "Redondo", value: 24 },
];

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="flex items-baseline justify-between gap-2">
        {label}
        {hint && <span className="font-label text-xs text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Range(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={props.label} hint={`${props.value}${props.unit}`}>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(event) => props.onChange(Number(event.target.value))}
        className="h-11 accent-[var(--accent)]"
      />
    </Field>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-card surface p-5 text-text">
      <h2 className="font-label text-xs tracking-[0.08em] text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function AppearanceForm({ saved }: { saved: Theme }) {
  const [theme, setTheme] = useState(saved);
  const [cropOpen, setCropOpen] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(theme) !== JSON.stringify(saved);

  useEffect(() => {
    let style = document.getElementById(LIVE_STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = LIVE_STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = cssVarsToRule(themeToCssVars(theme), "html:root");
  }, [theme]);

  useEffect(() => () => document.getElementById(LIVE_STYLE_ID)?.remove(), []);

  function update<K extends keyof Theme>(key: K, value: Theme[K]) {
    setTheme((current) => ({ ...current, [key]: value }));
  }

  function remember(hex: string) {
    setTheme((current) => ({
      ...current,
      recentColors: [hex, ...current.recentColors.filter((color) => color.toUpperCase() !== hex.toUpperCase())].slice(
        0,
        6,
      ),
    }));
  }

  const cardBackdrop = mix(theme.background.color, theme.surface.color, theme.surface.opacity / 100);
  const themeColors = [
    { label: "Destaque do tema", color: theme.accent },
    { label: "Fundo do tema", color: theme.background.color },
    { label: "Card do tema", color: theme.surface.color },
  ];

  const accentChecks = (hex: string): ContrastCheck[] => {
    const fill = accentFill(hex);
    const onCard = contrastRatio(hex, cardBackdrop);
    const onBackground = contrastRatio(hex, theme.background.color);
    return [
      {
        ok: true,
        label: "Texto no botão legível (ajustado automaticamente)",
        ratio: contrastRatio(fill.fill, fill.text),
      },
      {
        ok: onCard >= 4.5,
        label: onCard >= 4.5 ? "Links legíveis sobre os cards" : "Links sobre os cards serão clareados para ler",
        ratio: onCard,
      },
      {
        ok: onBackground >= 3,
        label: onBackground >= 3 ? "Destaque visível sobre o fundo" : "Pouco visível sobre o fundo",
        ratio: onBackground,
      },
    ];
  };

  const surfaceChecks = (hex: string): ContrastCheck[] => {
    const ratio = contrastRatio(readableOn(hex), hex);
    const minimum = minimumSurfaceOpacity({ ...theme, surface: { ...theme.surface, color: hex } });
    return [
      { ok: ratio >= 4.5, label: "Texto dos cards legível", ratio },
      ...(minimum ? [{ ok: false, label: `Com a imagem, use opacidade de pelo menos ${minimum}%`, ratio: ratio }] : []),
    ];
  };

  const backgroundChecks = (hex: string): ContrastCheck[] => {
    const ratio = contrastRatio(readableOn(hex), hex);
    const separation = contrastRatio(hex, theme.surface.color);
    return [
      { ok: ratio >= 4.5, label: "Títulos sobre o fundo legíveis", ratio },
      {
        ok: separation >= 1.15,
        label: separation >= 1.15 ? "Cards se destacam do fundo" : "Cards quase iguais ao fundo",
        ratio: separation,
      },
    ];
  };

  const minimumOpacity = minimumSurfaceOpacity(theme);

  function save() {
    startTransition(async () => {
      const result = await saveTheme(theme);
      setMessage(result.ok ? { ok: true, text: "Aparência salva." } : { ok: false, text: result.error });
    });
  }

  async function uploadBackground({ blob }: { blob: Blob }) {
    const path = await uploadMedia(blob, "backgrounds");
    if (theme.background.imagePath && theme.background.imagePath !== saved.background.imagePath) {
      await removeMedia(theme.background.imagePath);
    }
    setTheme((current) => ({ ...current, background: { ...current.background, imagePath: path } }));
  }

  const backgroundImage = theme.background.imagePath;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {backgroundImage ? (
        <ThemeBackdrop theme={theme} src={mediaUrl(backgroundImage)} />
      ) : (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-background" />
      )}

      <div className="flex flex-col gap-5">
        <Section title="Pontos de partida">
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  setTheme({ ...preset.theme, background: { ...preset.theme.background, imagePath: backgroundImage } })
                }
                className="flex items-center gap-2 rounded-pill border border-border-strong px-3 py-2 text-sm hover:border-accent"
              >
                <span
                  aria-hidden="true"
                  className="size-4 rounded-pill border border-border"
                  style={{
                    background: `linear-gradient(135deg, ${preset.theme.surface.color} 50%, ${preset.theme.accent} 50%)`,
                  }}
                />
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Fundo da visão imersiva">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorPicker
              label="Cor de fundo"
              value={theme.background.color}
              onChange={(color) =>
                setTheme((current) => ({ ...current, background: { ...current.background, color } }))
              }
              onCommit={remember}
              checks={backgroundChecks}
              preview="page"
              themeColors={themeColors}
              recentColors={theme.recentColors}
            />
            <div className="flex flex-col gap-1.5 text-sm">
              Imagem de fundo
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setCropOpen(true)}>
                  {backgroundImage ? "Trocar imagem" : "Escolher imagem"}
                </Button>
                {backgroundImage && (
                  <Button
                    variant="ghost"
                    onClick={() => update("background", { ...theme.background, imagePath: null })}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
          {backgroundImage && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Range
                label="Escurecer"
                value={theme.background.dim}
                min={0}
                max={90}
                unit="%"
                onChange={(dim) => update("background", { ...theme.background, dim })}
              />
              <Range
                label="Desfoque"
                value={theme.background.blur}
                min={0}
                max={24}
                unit="px"
                onChange={(blur) => update("background", { ...theme.background, blur })}
              />
            </div>
          )}
        </Section>

        <Section title="Cards e menus">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorPicker
              label="Cor dos cards"
              value={theme.surface.color}
              onChange={(color) => setTheme((current) => ({ ...current, surface: { ...current.surface, color } }))}
              onCommit={remember}
              checks={surfaceChecks}
              preview="card"
              themeColors={themeColors}
              recentColors={theme.recentColors}
            />
            <Range
              label="Opacidade"
              value={theme.surface.opacity}
              min={20}
              max={100}
              unit="%"
              onChange={(opacity) => update("surface", { ...theme.surface, opacity })}
            />
          </div>
          {minimumOpacity && (
            <div
              role="status"
              className="flex flex-wrap items-center gap-3 rounded-control bg-surface-raised px-3 py-2.5 text-sm"
            >
              <span className="flex-1">
                Com a imagem de fundo, o texto dos cards pode ficar ilegível em partes claras. Sugestão: opacidade de
                pelo menos {minimumOpacity}%.
              </span>
              <Button
                variant="secondary"
                onClick={() => update("surface", { ...theme.surface, opacity: minimumOpacity })}
              >
                Usar {minimumOpacity}%
              </Button>
            </div>
          )}
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={theme.surface.glass}
              onChange={(event) => update("surface", { ...theme.surface, glass: event.target.checked })}
              className="size-5 accent-[var(--accent)]"
            />
            Liquid glass: desfocar o que fica atrás dos cards e menus
          </label>
          {theme.surface.glass && (
            <Range
              label="Intensidade do vidro"
              value={theme.surface.blur}
              min={0}
              max={40}
              unit="px"
              onChange={(blur) => update("surface", { ...theme.surface, blur })}
            />
          )}
        </Section>

        <Section title="Forma e cor">
          <div className="flex flex-col gap-3">
            <Range
              label="Cantos"
              value={theme.radius}
              min={0}
              max={28}
              unit="px"
              onChange={(radius) => update("radius", radius)}
            />
            <div className="flex flex-wrap gap-2">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={theme.radius === preset.value}
                  onClick={() => update("radius", preset.value)}
                  className="border border-border px-3 py-1.5 text-sm aria-pressed:border-accent-text aria-pressed:text-accent-text"
                  style={{ borderRadius: preset.value }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <ColorPicker
            label="Cor de destaque"
            value={theme.accent}
            onChange={(accent) => setTheme((current) => ({ ...current, accent }))}
            onCommit={remember}
            checks={accentChecks}
            themeColors={themeColors}
            recentColors={theme.recentColors}
          />
        </Section>

        <Section title="Tipografia">
          <div role="radiogroup" aria-label="Fonte" className="grid gap-2 sm:grid-cols-2">
            {(Object.entries(FONT_OPTIONS) as Array<[FontOption, (typeof FONT_OPTIONS)[FontOption]]>).map(
              ([id, font]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={theme.font === id}
                  onClick={() => update("font", id)}
                  className="flex flex-col items-start gap-1 rounded-control border border-border p-3 text-left aria-checked:border-accent"
                >
                  <span className="text-lg" style={{ fontFamily: font.heading }}>
                    {font.label}
                  </span>
                  <span className="text-xs text-muted" style={{ fontFamily: font.body }}>
                    Persona 5 Royal · 12 out
                  </span>
                </button>
              ),
            )}
          </div>
        </Section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <div className="flex gap-4 rounded-card surface p-3.5 text-text">
          <div className="flex aspect-[3/4] w-[4.5rem] items-center justify-center rounded-control bg-surface-raised font-display text-2xl font-bold">
            P
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-label text-[11px] tracking-[0.08em] text-muted uppercase">Slot 01 · PS5</span>
            <span className="font-display font-medium">Persona 5 Royal</span>
            <span className="self-start rounded-control border border-border px-2 py-0.5 font-label text-[11px] uppercase">
              Jogando
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-card surface p-4 text-text">
          <span className="text-sm text-muted">Pré-visualização ao vivo: o app inteiro já reflete as mudanças.</span>
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={pending || !dirty}>
              {pending ? "Salvando…" : "Salvar"}
            </Button>
            <Button variant="ghost" onClick={() => setTheme(saved)} disabled={pending || !dirty}>
              Desfazer
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                setTheme({ ...DEFAULT_THEME, background: { ...DEFAULT_THEME.background, imagePath: null } })
              }
              disabled={pending}
            >
              Padrão
            </Button>
          </div>
          {message && (
            <p role="status" className={cn("text-sm", message.ok ? "text-muted" : "font-medium text-text")}>
              {message.text}
            </p>
          )}
        </div>
      </aside>

      <ImageCropDialog
        open={cropOpen}
        title="Imagem de fundo"
        aspect={16 / 9}
        maxWidth={2400}
        onClose={() => setCropOpen(false)}
        onCropped={uploadBackground}
      />
    </div>
  );
}
