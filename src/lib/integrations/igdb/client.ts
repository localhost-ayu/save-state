import "server-only";
import { z } from "zod";
import { igdbCredentials } from "@/lib/env.server";

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const API_URL = "https://api.igdb.com/v4";
const TOKEN_REFRESH_MARGIN_MS = 60_000;

const tokenSchema = z.object({ access_token: z.string(), expires_in: z.number() });

const gameSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  first_release_date: z.number().optional(),
  cover: z.object({ image_id: z.string() }).optional(),
  platforms: z.array(z.object({ abbreviation: z.string().optional(), name: z.string() })).optional(),
  genres: z.array(z.object({ name: z.string() })).optional(),
  franchises: z.array(z.object({ name: z.string() })).optional(),
});

export type IgdbGame = {
  igdbId: number;
  title: string;
  slug: string | null;
  summary: string | null;
  coverUrl: string | null;
  releaseDate: string | null;
  platforms: string[];
  genres: string[];
  franchise: string | null;
};

const GAME_FIELDS =
  "fields name,slug,summary,first_release_date,cover.image_id,platforms.name,platforms.abbreviation,genres.name,franchises.name;";

let token: { value: string; expiresAt: number } | undefined;

async function getAccessToken() {
  if (token && token.expiresAt - TOKEN_REFRESH_MARGIN_MS > Date.now()) return token.value;

  const { clientId, clientSecret } = igdbCredentials();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  if (!response.ok) throw new Error(`IGDB auth failed: ${response.status}`);

  const data = tokenSchema.parse(await response.json());
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

async function query<T>(endpoint: string, body: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": igdbCredentials().clientId,
      Authorization: `Bearer ${await getAccessToken()}`,
      "Content-Type": "text/plain",
    },
    body,
  });
  if (!response.ok) throw new Error(`IGDB ${endpoint} failed: ${response.status}`);
  return schema.parse(await response.json());
}

export function coverUrl(imageId: string, size: "cover_big" | "720p" | "1080p" = "cover_big") {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

function toGame(raw: z.infer<typeof gameSchema>): IgdbGame {
  return {
    igdbId: raw.id,
    title: raw.name,
    slug: raw.slug ?? null,
    summary: raw.summary ?? null,
    coverUrl: raw.cover ? coverUrl(raw.cover.image_id) : null,
    releaseDate: raw.first_release_date ? new Date(raw.first_release_date * 1000).toISOString().slice(0, 10) : null,
    platforms: raw.platforms?.map((p) => p.abbreviation ?? p.name) ?? [],
    genres: raw.genres?.map((g) => g.name) ?? [],
    franchise: raw.franchises?.[0]?.name ?? null,
  };
}

function escapeSearch(term: string) {
  return term.replace(/["\\]/g, "");
}

export async function searchGames(term: string, limit = 20): Promise<IgdbGame[]> {
  const results = await query(
    "games",
    `search "${escapeSearch(term)}"; ${GAME_FIELDS} limit ${limit};`,
    z.array(gameSchema),
  );
  return results.map(toGame);
}

export async function getGameById(igdbId: number): Promise<IgdbGame | null> {
  const [result] = await query("games", `${GAME_FIELDS} where id = ${igdbId};`, z.array(gameSchema));
  return result ? toGame(result) : null;
}
