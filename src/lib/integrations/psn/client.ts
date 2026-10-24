import "server-only";
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
  getProfileFromUserName,
  getUserPlayedGames,
  getUserTitles,
  getUserTrophiesForSpecificTitle,
  type AuthorizationPayload,
  type AuthTokensResponse,
  type TrophyTitle,
} from "psn-api";
import { parseIsoDuration } from "./duration";

export type PsnTokens = {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export type PsnTitleSnapshot = {
  npCommunicationId: string;
  npServiceName: string;
  titleIds: string[];
  name: string;
  iconUrl: string | null;
  platforms: string[];
  progress: number;
  defined: TrophyGrades;
  earned: TrophyGrades;
  lastTrophyAt: string | null;
  playDurationSeconds: number | null;
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
};

type TrophyGrades = { bronze: number; silver: number; gold: number; platinum: number };

const TITLES_PAGE_SIZE = 800;
const PLAYED_PAGE_SIZE = 200;
const TITLE_ID_BATCH = 5;

function toTokens(response: AuthTokensResponse, now = Date.now()): PsnTokens {
  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: new Date(now + response.expiresIn * 1000),
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: new Date(now + response.refreshTokenExpiresIn * 1000),
  };
}

export async function authenticateWithNpsso(npsso: string): Promise<PsnTokens> {
  const accessCode = await exchangeNpssoForAccessCode(npsso);
  return toTokens(await exchangeAccessCodeForAuthTokens(accessCode));
}

export async function refreshTokens(refreshToken: string): Promise<PsnTokens> {
  return toTokens(await exchangeRefreshTokenForAuthTokens(refreshToken));
}

export async function getOwnProfile(auth: AuthorizationPayload) {
  const { profile } = await getProfileFromUserName(auth, "me");
  return {
    accountId: profile.accountId,
    onlineId: profile.onlineId,
    avatarUrl: profile.avatarUrls.at(-1)?.avatarUrl ?? null,
  };
}

async function fetchAllTrophyTitles(auth: AuthorizationPayload): Promise<TrophyTitle[]> {
  const titles: TrophyTitle[] = [];
  let offset: number | undefined = 0;

  while (offset !== undefined) {
    const page = await getUserTitles(auth, "me", { limit: TITLES_PAGE_SIZE, offset });
    titles.push(...page.trophyTitles);
    offset = page.nextOffset;
  }

  return titles;
}

async function fetchAllPlayedGames(auth: AuthorizationPayload) {
  const games: Awaited<ReturnType<typeof getUserPlayedGames>>["titles"] = [];
  let offset = 0;

  for (;;) {
    const page = await getUserPlayedGames(auth, "me", { limit: PLAYED_PAGE_SIZE, offset });
    games.push(...page.titles);
    offset += page.titles.length;
    if (page.titles.length === 0 || offset >= page.totalItemCount) break;
  }

  return games;
}

async function mapTitleIdsToCommunicationIds(auth: AuthorizationPayload, titleIds: string[]) {
  const mapping = new Map<string, string>();

  for (let i = 0; i < titleIds.length; i += TITLE_ID_BATCH) {
    const batch = titleIds.slice(i, i + TITLE_ID_BATCH);
    const response = await getUserTrophiesForSpecificTitle(auth, "me", { npTitleIds: batch.join(",") });
    for (const title of response.titles) {
      const communicationId = title.trophyTitles[0]?.npCommunicationId;
      if (communicationId) mapping.set(title.npTitleId, communicationId);
    }
  }

  return mapping;
}

export async function fetchTitleSnapshots(
  auth: AuthorizationPayload,
  options: { updatedSince?: Date } = {},
): Promise<PsnTitleSnapshot[]> {
  const [trophyTitles, playedGames] = await Promise.all([fetchAllTrophyTitles(auth), fetchAllPlayedGames(auth)]);

  const changedTitles = options.updatedSince
    ? trophyTitles.filter((title) => new Date(title.lastUpdatedDateTime) > options.updatedSince!)
    : trophyTitles;

  const changedPlayed = options.updatedSince
    ? playedGames.filter((game) => new Date(game.lastPlayedDateTime) > options.updatedSince!)
    : playedGames;

  const communicationIdByTitleId = await mapTitleIdsToCommunicationIds(
    auth,
    changedPlayed.map((game) => game.titleId),
  );

  const playedByCommunicationId = new Map<string, (typeof playedGames)[number][]>();
  for (const game of changedPlayed) {
    const communicationId = communicationIdByTitleId.get(game.titleId);
    if (!communicationId) continue;
    playedByCommunicationId.set(communicationId, [...(playedByCommunicationId.get(communicationId) ?? []), game]);
  }

  const titlesById = new Map(trophyTitles.map((title) => [title.npCommunicationId, title]));
  const ids = new Set([...changedTitles.map((title) => title.npCommunicationId), ...playedByCommunicationId.keys()]);

  return [...ids].flatMap((id) => {
    const title = titlesById.get(id);
    if (!title) return [];

    const played = playedByCommunicationId.get(id) ?? [];
    const durations = played.map((game) => parseIsoDuration(game.playDuration)).filter((s) => s !== null);
    const firstPlayed = played.map((game) => game.firstPlayedDateTime).sort()[0] ?? null;
    const lastPlayed =
      played
        .map((game) => game.lastPlayedDateTime)
        .sort()
        .at(-1) ?? null;

    return {
      npCommunicationId: title.npCommunicationId,
      npServiceName: title.npServiceName,
      titleIds: played.map((game) => game.titleId),
      name: title.trophyTitleName,
      iconUrl: title.trophyTitleIconUrl ?? null,
      platforms: title.trophyTitlePlatform.split(","),
      progress: title.progress,
      defined: title.definedTrophies,
      earned: title.earnedTrophies,
      lastTrophyAt: title.lastUpdatedDateTime ?? null,
      playDurationSeconds: durations.length ? durations.reduce((a, b) => a + b, 0) : null,
      firstPlayedAt: firstPlayed,
      lastPlayedAt: lastPlayed,
    };
  });
}
