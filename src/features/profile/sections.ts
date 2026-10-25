import { z } from "zod";

export const PROFILE_SECTIONS = {
  now_playing: "Jogando agora",
  favorites: "Favoritos",
  year_stats: "Números do ano",
  finished_year: "Finalizados do ano",
  reviews: "Reviews recentes",
  gallery: "Galeria de screenshots",
} as const;

export type ProfileSectionId = keyof typeof PROFILE_SECTIONS;

export const SECTION_IDS = Object.keys(PROFILE_SECTIONS) as [ProfileSectionId, ...ProfileSectionId[]];

export const sectionSchema = z.object({ id: z.enum(SECTION_IDS), visible: z.boolean() });

export type ProfileSection = z.infer<typeof sectionSchema>;

export function normalizeSections(value: unknown): ProfileSection[] {
  const parsed = z.array(z.unknown()).safeParse(value);
  const saved = (parsed.success ? parsed.data : [])
    .map((item) => sectionSchema.safeParse(item))
    .flatMap((result) => (result.success ? [result.data] : []));

  const seen = new Set<ProfileSectionId>();
  const ordered = saved.filter((section) => !seen.has(section.id) && seen.add(section.id));
  const missing = SECTION_IDS.filter((id) => !seen.has(id)).map((id) => ({ id, visible: true }));
  return [...ordered, ...missing];
}

export function moveSection(sections: ProfileSection[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= sections.length) return sections;
  const next = [...sections];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
