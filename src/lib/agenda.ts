import "server-only";
import { addDays, dayOf, parisToUtc, timeOf } from "@/lib/dates";
import type { createClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createClient>>;

/** Une date du calendrier : un rendez-vous (client_events) ou le jour de l'événement d'un client (clients.event_date). */
export interface AgendaItem {
  id: string;
  kind: "rdv" | "shooting";
  title: string;
  client: string;
  /** Jour à Paris, « AAAA-MM-JJ ». */
  day: string;
  /** Heure à Paris, absente pour un shooting (journée entière). */
  time: string | null;
  location: string | null;
}

interface EventRow {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  clients: { name: string } | null;
}

interface ShootingRow {
  id: string;
  name: string;
  event_type: string | null;
  event_date: string;
}

/**
 * Les dates du photographe `ownerId` entre deux jours inclus, dans l'ordre. Filtré par propriétaire en plus
 * de la RLS : un compte peut aussi lire, comme client, les lignes d'un autre studio.
 */
export async function loadAgenda(db: Db, ownerId: string, from: string, to: string): Promise<AgendaItem[]> {
  const [{ data: events }, { data: shootings }] = await Promise.all([
    db
      .from("client_events")
      .select("id, title, starts_at, location, clients(name)")
      .eq("photographer_id", ownerId)
      .gte("starts_at", parisToUtc(from).toISOString())
      .lt("starts_at", parisToUtc(addDays(to, 1)).toISOString())
      .order("starts_at"),
    db.from("clients").select("id, name, event_type, event_date").eq("photographer_id", ownerId).gte("event_date", from).lte("event_date", to),
  ]);

  const items: AgendaItem[] = [
    ...((events ?? []) as unknown as EventRow[]).map((e) => ({
      id: `rdv-${e.id}`,
      kind: "rdv" as const,
      title: e.title,
      client: e.clients?.name ?? "",
      day: dayOf(e.starts_at),
      time: timeOf(e.starts_at),
      location: e.location,
    })),
    ...((shootings ?? []) as ShootingRow[]).map((c) => ({
      id: `shooting-${c.id}`,
      kind: "shooting" as const,
      title: c.event_type || "Shooting",
      client: c.name,
      day: c.event_date,
      time: null,
      location: null,
    })),
  ];
  // Journées entières d'abord, puis par heure.
  return items.sort((a, b) => a.day.localeCompare(b.day) || (a.time ?? "").localeCompare(b.time ?? ""));
}
