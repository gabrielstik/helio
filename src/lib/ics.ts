import { addDays } from "@/lib/dates";

/** Une ligne de public.calendar_feed : un rendez-vous (starts_at) ou une journée entière (on_day). */
export interface FeedRow {
  uid: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  on_day: string | null;
  location: string | null;
}

/** Sans fin enregistrée, un rendez-vous dure une heure. */
const DEFAULT_MINUTES = 60;

/** Texte d'une propriété iCalendar (RFC 5545 §3.3.11). */
function text(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Lignes de 75 octets au plus, la suite commençant par une espace (§3.1), sans couper un caractère. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      out.push(current);
      current = " ";
      bytes = 1;
    }
    current += char;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n");
}

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const date = (day: string) => day.replace(/-/g, "");

/** Le flux iCal du photographe, que Google Agenda, Apple Calendar et Outlook relisent régulièrement. */
export function toIcs(rows: FeedRow[], calendarName: string, host: string): string {
  const stamp = utc(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${calendarName}//Calendrier//FR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${text(calendarName)}`,
    "X-WR-TIMEZONE:Europe/Paris",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];
  for (const row of rows) {
    const event = ["BEGIN:VEVENT", `UID:${row.uid}@${host}`, `DTSTAMP:${stamp}`, `SUMMARY:${text(row.title)}`];
    if (row.on_day) {
      event.push(`DTSTART;VALUE=DATE:${date(row.on_day)}`, `DTEND;VALUE=DATE:${date(addDays(row.on_day, 1))}`, "TRANSP:TRANSPARENT");
    } else if (row.starts_at) {
      const end = row.ends_at ?? new Date(new Date(row.starts_at).getTime() + DEFAULT_MINUTES * 60_000).toISOString();
      event.push(`DTSTART:${utc(row.starts_at)}`, `DTEND:${utc(end)}`);
    } else {
      continue;
    }
    if (row.location) event.push(`LOCATION:${text(row.location)}`);
    event.push("END:VEVENT");
    lines.push(...event);
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
