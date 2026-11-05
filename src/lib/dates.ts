/**
 * Dates du studio, toujours lues à l'heure de Paris : un jour (« 2026-11-12 ») est un jour du calendrier
 * français, quel que soit le fuseau du serveur. À rendre réglable par photographe le jour où il en faudra un autre.
 */
export const TIME_ZONE = "Europe/Paris";

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function parts(at: Date) {
  const p = Object.fromEntries(PARTS.formatToParts(at).map((x) => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour, minute: +p.minute, second: +p.second };
}

/** Écart de Paris avec UTC à cet instant, en minutes (60 l'hiver, 120 l'été). */
function offsetMinutes(at: Date): number {
  const p = parts(at);
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - at.getTime()) / 60_000;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Le jour à Paris de cet instant : « AAAA-MM-JJ ». */
export function dayOf(at: Date | string): string {
  const p = parts(typeof at === "string" ? new Date(at) : at);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** L'heure à Paris de cet instant : « HH:MM ». */
export function timeOf(at: Date | string): string {
  const p = parts(typeof at === "string" ? new Date(at) : at);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** L'instant UTC d'un jour et d'une heure de Paris (passages à l'heure d'été compris). */
export function parisToUtc(day: string, time = "00:00"): Date {
  const [y, m, d] = day.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, h, mi);
  const first = wall - offsetMinutes(new Date(wall)) * 60_000;
  return new Date(wall - offsetMinutes(new Date(first)) * 60_000);
}

/** Jour décalé de `n` jours (calcul sur le calendrier, sans heure). */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Aujourd'hui à Paris. */
export function today(): string {
  return dayOf(new Date());
}

/** 0 = lundi … 6 = dimanche. */
export function weekdayOf(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

const asNoon = (day: string) => new Date(`${day}T12:00:00Z`);
const SHORT = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const LONG = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const MONTH = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const MONTH_SHORT = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" });

/** « jeu. 12 nov. » */
export const shortDay = (day: string) => SHORT.format(asNoon(day));
/** « jeudi 12 novembre » */
export const longDay = (day: string) => LONG.format(asNoon(day));
/** « Novembre 2026 » */
export const monthLabel = (day: string) => {
  const label = MONTH.format(asNoon(day));
  return label.charAt(0).toUpperCase() + label.slice(1);
};
/** « nov. » */
export const shortMonth = (day: string) => MONTH_SHORT.format(asNoon(day));
