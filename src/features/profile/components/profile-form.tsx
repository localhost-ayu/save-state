"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS } from "@/features/library/constants";
import { ImageCropDialog } from "@/features/media/components/image-crop-dialog";
import { removeMedia, uploadMedia } from "@/features/media/image";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";
import { saveProfile, setProfileImage } from "../actions";
import type { MyProfileSettings } from "../queries";
import type { ProfileLink } from "../schemas";
import { PROFILE_SECTIONS, moveSection, type ProfileSection } from "../sections";

const MAX_LINKS = 6;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-card surface p-5 text-text">
      <h2 className="font-label text-xs tracking-[0.08em] text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

function ImagePicker({ kind, path, title }: { kind: "avatar" | "banner"; path: string | null; title: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isAvatar = kind === "avatar";

  async function save({ blob }: { blob: Blob }) {
    const newPath = await uploadMedia(blob, isAvatar ? "avatars" : "banners");
    const result = await setProfileImage(kind, newPath);
    if (!result.ok) {
      await removeMedia(newPath);
      throw new Error(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm">{title}</span>
      <div
        className={cn(
          "overflow-hidden bg-surface-raised",
          isAvatar ? "size-24 rounded-pill" : "aspect-[3/1] w-full rounded-control",
        )}
      >
        {path && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(path)} alt="" className="size-full object-cover" />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {path ? "Trocar" : "Escolher"}
        </Button>
        {path && (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await setProfileImage(kind, null);
                setError(result.ok ? null : result.error);
              })
            }
          >
            Remover
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <ImageCropDialog
        open={open}
        title={title}
        aspect={isAvatar ? 1 : 3}
        cropShape={isAvatar ? "round" : "rect"}
        maxWidth={isAvatar ? 400 : 1500}
        onClose={() => setOpen(false)}
        onCropped={save}
      />
    </div>
  );
}

export function ProfileForm({ profile, entries }: MyProfileSettings) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [tagline, setTagline] = useState(profile.tagline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [links, setLinks] = useState<ProfileLink[]>(profile.links);
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [featuredEntryId, setFeaturedEntryId] = useState(profile.featured_entry_id ?? "");
  const [sections, setSections] = useState<ProfileSection[]>(profile.sections);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function updateLink(index: number, patch: Partial<ProfileLink>) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveProfile({
        username,
        displayName,
        tagline,
        bio,
        links,
        isPublic,
        featuredEntryId: featuredEntryId || null,
        sections,
      });
      setMessage(result.ok ? { ok: true, text: "Perfil salvo." } : { ok: false, text: result.error });
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form id="profile-form" onSubmit={submit} className="flex flex-col gap-5">
        <Section title="Identidade">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              Nome de usuário
              <Input value={username} onChange={(event) => setUsername(event.target.value)} required />
              <span className="text-xs text-muted">Seu endereço: /u/{username || "…"}</span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Nome de exibição
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            Tagline
            <Input
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              maxLength={80}
              placeholder="Uma frase sua, aparece em destaque"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={1000}
              rows={4}
              className="rounded-control border border-border bg-surface-solid p-3 text-text"
            />
          </label>
        </Section>

        <Section title="Links">
          {links.map((link, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]">
              <Input
                aria-label={`Nome do link ${index + 1}`}
                value={link.label}
                onChange={(event) => updateLink(index, { label: event.target.value })}
                placeholder="Backloggd"
                maxLength={30}
              />
              <Input
                aria-label={`Endereço do link ${index + 1}`}
                value={link.url}
                onChange={(event) => updateLink(index, { url: event.target.value })}
                placeholder="https://"
                type="url"
              />
              <Button
                variant="ghost"
                aria-label={`Remover link ${index + 1}`}
                onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
              >
                ✕
              </Button>
            </div>
          ))}
          {links.length < MAX_LINKS && (
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => setLinks((current) => [...current, { label: "", url: "" }])}
            >
              + Adicionar link
            </Button>
          )}
        </Section>

        <Section title="Seções do perfil">
          <p className="text-sm text-muted">Escolha o que aparece no seu perfil público e em que ordem.</p>
          <ol className="flex flex-col gap-2">
            {sections.map((section, index) => (
              <li
                key={section.id}
                className={cn(
                  "flex items-center gap-3 rounded-control border border-border px-3 py-2",
                  !section.visible && "opacity-60",
                )}
              >
                <span className="font-label text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
                <label className="flex flex-1 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={(event) =>
                      setSections((current) =>
                        current.map((s) => (s.id === section.id ? { ...s, visible: event.target.checked } : s)),
                      )
                    }
                    className="size-4 accent-[var(--accent)]"
                  />
                  {PROFILE_SECTIONS[section.id]}
                </label>
                <Button
                  variant="ghost"
                  className="size-10 px-0"
                  aria-label={`Mover ${PROFILE_SECTIONS[section.id]} para cima`}
                  disabled={index === 0}
                  onClick={() => setSections((current) => moveSection(current, index, -1))}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  className="size-10 px-0"
                  aria-label={`Mover ${PROFILE_SECTIONS[section.id]} para baixo`}
                  disabled={index === sections.length - 1}
                  onClick={() => setSections((current) => moveSection(current, index, 1))}
                >
                  ↓
                </Button>
              </li>
            ))}
          </ol>
          <label className="flex flex-col gap-1.5 text-sm">
            Jogo em destaque em &quot;Jogando agora&quot;
            <select
              value={featuredEntryId}
              onChange={(event) => setFeaturedEntryId(event.target.value)}
              className="h-10 rounded-control border border-border bg-surface-solid px-2 text-text"
            >
              <option value="">Automático (o último Iniciado)</option>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.game.title} · {STATUS_LABELS[entry.status]}
                </option>
              ))}
            </select>
          </label>
        </Section>
      </form>

      <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <Section title="Imagens">
          <ImagePicker kind="avatar" path={profile.avatar_path} title="Foto de perfil" />
          <ImagePicker kind="banner" path={profile.banner_path} title="Banner" />
        </Section>
        <Section title="Publicação">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              form="profile-form"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="size-5 accent-[var(--accent)]"
            />
            Perfil público
          </label>
          <p className="text-xs text-muted">
            Reviews, registros e screenshots marcados como privados nunca aparecem, mesmo com o perfil público.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" form="profile-form" disabled={pending}>
              {pending ? "Salvando…" : "Salvar perfil"}
            </Button>
            <Link
              href={`/u/${profile.username}`}
              className="inline-flex h-10 items-center rounded-control bg-surface-raised px-4 text-sm font-medium"
            >
              Ver perfil
            </Link>
          </div>
          {message && (
            <p role="status" className={cn("text-sm", message.ok ? "text-muted" : "text-red-400")}>
              {message.text}
            </p>
          )}
        </Section>
      </aside>
    </div>
  );
}
