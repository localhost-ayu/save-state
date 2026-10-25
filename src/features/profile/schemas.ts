import { z } from "zod";
import { sectionSchema } from "./sections";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable();

export const profileLinkSchema = z.object({
  label: z.string().trim().min(1, "Dê um nome ao link").max(30),
  url: z.url({ protocol: /^https?$/, message: "Use um link http(s) válido" }),
});

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_.-]{3,30}$/, "Use 3 a 30 caracteres: letras, números, ponto, hífen ou _"),
  displayName: optionalText(60),
  tagline: optionalText(80),
  bio: optionalText(1000),
  links: z.array(profileLinkSchema).max(6),
  isPublic: z.boolean(),
  featuredEntryId: z.uuid().nullable(),
  sections: z.array(sectionSchema),
});

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileLink = z.infer<typeof profileLinkSchema>;
