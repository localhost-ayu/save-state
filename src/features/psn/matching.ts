const PLATFORM_SUFFIX = /\s*[-–:(\[]?\s*\b(ps[345]|ps ?vita|playstation ?[345]|ps4 (?:&|and) ps5)\b\s*[)\]]?\s*$/i;
const TROPHY_SUFFIX = /\s*\btrophies\b\s*$/i;
const SYMBOLS = /[™®©]/g;
const NON_ALNUM = /[^\p{L}\p{N}]+/gu;

export function normalizeTitle(title: string) {
  let value = title.replace(SYMBOLS, "").trim();
  value = value.replace(TROPHY_SUFFIX, "");
  for (let i = 0; i < 2; i++) value = value.replace(PLATFORM_SUFFIX, "");
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(NON_ALNUM, " ").trim();
}

export function pickExactMatch<T extends { title: string }>(psnName: string, candidates: T[]): T | null {
  const target = normalizeTitle(psnName);
  const matches = candidates.filter((candidate) => normalizeTitle(candidate.title) === target);
  return matches.length === 1 ? matches[0] : null;
}

const PSN_PLATFORM_LABELS: Record<string, string> = {
  PS5: "PS5",
  PS4: "PS4",
  PS3: "PS3",
  PSVITA: "PS Vita",
  PSPC: "PC",
};

export function primaryPlatform(platforms: string[]) {
  const preferred = ["PS5", "PS4", "PS3", "PSVITA", "PSPC"].find((platform) => platforms.includes(platform));
  return preferred ? PSN_PLATFORM_LABELS[preferred] : (platforms[0] ?? null);
}
