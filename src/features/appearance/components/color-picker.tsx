"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { formatRatio, hexToHsv, hsvToHex, readableOn, type Hsv } from "../color";
import { accentFill } from "../theme";

export type ContrastCheck = { label: string; ok: boolean; ratio: number };

type Props = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  onCommit?: (hex: string) => void;
  checks: (hex: string) => ContrastCheck[];
  themeColors: Array<{ label: string; color: string }>;
  recentColors: string[];
  preview?: "button" | "card" | "page";
};

const PREVIEW_LABELS = { button: "No botão", card: "No card", page: "No fundo" } as const;

const SUGGESTIONS = ["#F90000", "#FF8FC8", "#FFB547", "#7DE3B0", "#7FD1FF", "#A9C7FF", "#B69CFF", "#1F2A44", "#F4F1EA"];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function Swatch({
  color,
  label,
  selected,
  onPick,
}: {
  color: string;
  label: string;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={`${label} ${color}`}
      aria-pressed={selected}
      className="flex size-11 items-center justify-center"
    >
      <span
        className={cn(
          "size-8 rounded-control shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]",
          selected ? "ring-2 ring-text ring-offset-2 ring-offset-surface-solid" : "ring-1 ring-border-strong",
        )}
        style={{ background: color }}
      />
    </button>
  );
}

function CheckGlyph({ ok }: { ok: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      {ok ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : (
        <>
          <path d="M12 3 2 21h20z" />
          <path d="M12 10v4M12 17.5v.01" />
        </>
      )}
    </svg>
  );
}

function Panel({
  label,
  initial,
  onChange,
  onClose,
  checks,
  themeColors,
  recentColors,
  anchor,
  panelRef,
  preview = "button",
}: Omit<Props, "value" | "onCommit"> & {
  initial: string;
  onClose: (commit: boolean, hex: string) => void;
  anchor: Anchor;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(initial));
  const [draft, setDraft] = useState(initial.slice(1));
  const [invalid, setInvalid] = useState(false);
  const dragging = useRef<"sv" | "hue" | null>(null);
  const hexId = useId();
  const hex = hsvToHex(hsv);
  const results = checks(hex);

  function apply(next: Hsv) {
    setHsv(next);
    const nextHex = hsvToHex(next);
    setDraft(nextHex.slice(1));
    setInvalid(false);
    onChange(nextHex);
  }

  function applyHex(value: string) {
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return false;
    const next = hexToHsv(`#${value}`);
    apply({ ...next, h: next.s ? next.h : hsv.h });
    return true;
  }

  function fromPointer(event: PointerEvent<HTMLDivElement>, kind: "sv" | "hue") {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width);
    if (kind === "hue") apply({ ...hsv, h: x * 360 });
    else apply({ ...hsv, s: x, v: clamp(1 - (event.clientY - rect.top) / rect.height) });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>, kind: "sv" | "hue") {
    dragging.current = kind;
    event.currentTarget.setPointerCapture(event.pointerId);
    fromPointer(event, kind);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>, kind: "sv" | "hue") {
    if (dragging.current === kind) fromPointer(event, kind);
  }

  function endDrag() {
    dragging.current = null;
  }

  function svKey(event: KeyboardEvent) {
    const step = event.shiftKey ? 0.1 : 0.01;
    const moves: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: clamp(hsv.s - step) },
      ArrowRight: { s: clamp(hsv.s + step) },
      ArrowUp: { v: clamp(hsv.v + step) },
      ArrowDown: { v: clamp(hsv.v - step) },
    };
    if (!moves[event.key]) return;
    event.preventDefault();
    apply({ ...hsv, ...moves[event.key] });
  }

  function hueKey(event: KeyboardEvent) {
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, number> = {
      ArrowLeft: hsv.h - step,
      ArrowDown: hsv.h - step,
      ArrowRight: hsv.h + step,
      ArrowUp: hsv.h + step,
      Home: 0,
      End: 359,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    apply({ ...hsv, h: (moves[event.key] + 360) % 360 });
  }

  const swatches = [
    ...themeColors,
    ...recentColors.map((color) => ({ label: "Recente", color })),
    ...SUGGESTIONS.map((color) => ({ label: "Sugestão", color })),
  ].filter(
    (item, index, list) => list.findIndex((other) => other.color.toUpperCase() === item.color.toUpperCase()) === index,
  );

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      onKeyDown={(event) => event.key === "Escape" && (event.stopPropagation(), onClose(false, initial))}
      style={{ "--anchor-top": `${anchor.top}px`, "--anchor-left": `${anchor.left}px` } as React.CSSProperties}
      className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col gap-4 overflow-y-auto rounded-t-card surface bg-surface-solid p-5 text-text shadow-2xl sm:inset-x-auto sm:top-[var(--anchor-top)] sm:bottom-auto sm:left-[var(--anchor-left)] sm:w-[22.5rem] sm:rounded-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-label text-[11px] tracking-[0.12em] text-muted uppercase">Aparência</span>
          <span className="font-display text-lg font-semibold">{label}</span>
        </div>
        <button
          type="button"
          onClick={() => onClose(true, hex)}
          className="min-h-11 rounded-control px-3 text-sm font-medium text-accent-text"
        >
          Pronto
        </button>
      </div>

      <div
        className="relative h-[168px] cursor-crosshair touch-none rounded-control"
        style={{ background: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }}
        onPointerDown={(event) => startDrag(event, "sv")}
        onPointerMove={(event) => moveDrag(event, "sv")}
        onPointerUp={endDrag}
      >
        <div className="absolute inset-0 rounded-control bg-[linear-gradient(to_right,#fff,rgba(255,255,255,0))]" />
        <div className="absolute inset-0 rounded-control bg-[linear-gradient(to_top,#000,rgba(0,0,0,0))] shadow-[inset_0_0_0_1px_var(--border)]" />
        <button
          type="button"
          role="slider"
          aria-label="Saturação e brilho"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(hsv.s * 100)}
          aria-valuetext={`Saturação ${Math.round(hsv.s * 100)}%, brilho ${Math.round(hsv.v * 100)}%`}
          onKeyDown={svKey}
          className="absolute -mt-[11px] -ml-[11px] size-[22px] cursor-grab rounded-full border-[3px] border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.55),0_2px_6px_rgba(0,0,0,0.35)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }}
        />
      </div>

      <div
        className="relative flex h-11 cursor-pointer touch-none items-center"
        onPointerDown={(event) => startDrag(event, "hue")}
        onPointerMove={(event) => moveDrag(event, "hue")}
        onPointerUp={endDrag}
      >
        <div className="absolute inset-x-0 h-3.5 rounded-full bg-[linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]" />
        <button
          type="button"
          role="slider"
          aria-label="Matiz"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(hsv.h)}
          aria-valuetext={`${Math.round(hsv.h)} graus`}
          onKeyDown={hueKey}
          className="absolute -ml-3 size-6 cursor-grab rounded-full border-[3px] border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.55),0_2px_6px_rgba(0,0,0,0.35)]"
          style={{ left: `${(hsv.h / 360) * 100}%`, background: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }}
        />
      </div>

      <div className="flex items-end gap-2.5">
        <label htmlFor={hexId} className="flex flex-1 flex-col gap-1.5">
          <span className="font-label text-[11px] tracking-[0.12em] text-muted uppercase">Hex</span>
          <span
            className={cn(
              "flex h-11 items-center gap-1.5 rounded-control border bg-surface-solid px-3",
              invalid ? "border-text" : "border-border-strong",
            )}
          >
            <span aria-hidden="true" className="font-label text-muted">
              #
            </span>
            <input
              id={hexId}
              value={draft}
              maxLength={7}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={invalid}
              aria-describedby={`${hexId}-help`}
              onChange={(event) => {
                const value = event.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                setDraft(value.toUpperCase());
                if (value.length === 6) applyHex(value);
              }}
              onBlur={() => !applyHex(draft) && setInvalid(true)}
              onKeyDown={(event) => event.key === "Enter" && !applyHex(draft) && setInvalid(true)}
              className="min-w-0 flex-1 bg-transparent font-label text-[15px] tracking-wider uppercase outline-none"
            />
          </span>
        </label>
        <div className="flex w-32 flex-col gap-1.5">
          <span className="font-label text-[11px] tracking-[0.12em] whitespace-nowrap text-muted uppercase">
            {PREVIEW_LABELS[preview]}
          </span>
          <Preview hex={hex} mode={preview} />
        </div>
      </div>
      <p id={`${hexId}-help`} className="-mt-2 min-h-4 text-xs text-muted">
        {invalid ? "Use 6 dígitos hexadecimais, como 7FD1FF." : "Setas movem 1%, Shift + setas 10%."}
      </p>

      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-1.5 rounded-control bg-surface-raised px-3 py-2.5"
      >
        {results.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-[13px] leading-tight">
            <CheckGlyph ok={check.ok} />
            <span className="flex-1">{check.label}</span>
            <span className="font-label text-xs text-muted">{formatRatio(check.ratio)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-label text-[11px] tracking-[0.12em] text-muted uppercase">
          Do tema, recentes e sugestões
        </span>
        <div className="grid grid-cols-6 gap-1">
          {swatches.map((item) => (
            <Swatch
              key={`${item.label}-${item.color}`}
              color={item.color}
              label={item.label}
              selected={item.color.toUpperCase() === hex}
              onPick={() => applyHex(item.color.slice(1))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Preview({ hex, mode }: { hex: string; mode: "button" | "card" | "page" }) {
  const colors = mode === "button" ? accentFill(hex) : { fill: hex, text: readableOn(hex) };
  return (
    <span
      className="flex h-11 items-center justify-center rounded-control text-[15px] font-semibold ring-1 ring-border-strong"
      style={{ background: colors.fill, color: colors.text }}
    >
      {mode === "button" ? "Salvar" : "Aa texto"}
    </span>
  );
}

type Anchor = { top: number; left: number };

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 620;

function anchorFor(trigger: HTMLElement): Anchor {
  const rect = trigger.getBoundingClientRect();
  const below = rect.bottom + 8;
  const top = below + PANEL_HEIGHT > window.innerHeight ? Math.max(8, rect.top - PANEL_HEIGHT - 8) : below;
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - PANEL_WIDTH - 8);
  return { top, left };
}

export function ColorPicker({
  label,
  value,
  onChange,
  onCommit,
  checks,
  themeColors,
  recentColors,
  preview = "button",
}: Props) {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState(value);
  const [anchor, setAnchor] = useState<Anchor>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: globalThis.PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      onCommit?.(value);
    }
    function reposition() {
      if (triggerRef.current) setAnchor(anchorFor(triggerRef.current));
    }
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, value, onCommit]);

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => {
          setInitial(value);
          setAnchor(anchorFor(event.currentTarget));
          setOpen((current) => !current);
        }}
        className="flex min-h-11 items-center gap-3 rounded-control border border-border-strong bg-surface-solid px-2 text-left text-text"
      >
        <span
          className="size-7 rounded-[calc(var(--card-radius)*0.4)] ring-1 ring-border-strong"
          style={{ background: value }}
        />
        <span className="flex-1">{label}</span>
        <span className="font-label text-xs text-muted">{value.toUpperCase()}</span>
      </button>
      {open &&
        createPortal(
          <Panel
            label={label}
            initial={initial}
            anchor={anchor}
            panelRef={panelRef}
            onChange={onChange}
            checks={checks}
            themeColors={themeColors}
            recentColors={recentColors}
            preview={preview}
            onClose={(commit, hex) => {
              setOpen(false);
              triggerRef.current?.focus();
              if (commit) onCommit?.(hex);
              else onChange(initial);
            }}
          />,
          document.body,
        )}
    </div>
  );
}
