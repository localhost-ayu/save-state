"use client";

import { useState } from "react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="min-h-11 rounded-pill px-4 text-sm text-text hover:bg-surface-raised"
    >
      <span aria-live="polite">{copied ? "Link copiado" : "Copiar link"}</span>
    </button>
  );
}
