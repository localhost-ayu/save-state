export const APP_TIME_ZONE = "America/Sao_Paulo";

export function todayIso(now = new Date(), timeZone = APP_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
