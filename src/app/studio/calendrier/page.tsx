import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { AgendaList } from "@/components/AgendaList";
import { PageHeader } from "@/components/PageHeader";
import { loadAgenda, type AgendaItem } from "@/lib/agenda";
import { getSessionUser } from "@/lib/auth";
import { addDays, longDay, monthLabel, today, weekdayOf } from "@/lib/dates";
import { APP_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { CalendarSyncDialog } from "./CalendarSyncDialog";
import { NewEventDialog } from "./NewEventDialog";

export const metadata: Metadata = { title: "Calendrier" };

const WEEKDAYS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

/** « 2026-11 » décalé de `n` mois. */
function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
}

function Chip({ item }: { item: AgendaItem }) {
  const label = item.kind === "shooting" ? `${item.title} · ${item.client}` : `${item.time} ${item.title}`;
  return (
    <span className="lp-cal-chip" data-kind={item.kind} title={[label, item.client, item.location].filter(Boolean).join(" · ")}>
      {label}
    </span>
  );
}

/**
 * Le mois du photographe (?mois=AAAA-MM) : ses rendez-vous et les jours de shooting de ses clients, en grille
 * du lundi au dimanche ; en liste quand la place manque (téléphone, tablette avec la barre latérale), où la grille
 * serait illisible. Une case montre toutes ses dates et s'allonge au besoin : rien n'est caché derrière un « + N ».
 */
export default async function CalendarPage({ searchParams }: PageProps<"/studio/calendrier">) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/studio/calendrier");
  const sp = await searchParams;
  const now = today();
  const month = typeof sp.mois === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.mois) ? sp.mois : now.slice(0, 7);
  const first = `${month}-01`;
  const last = addDays(`${shiftMonth(month, 1)}-01`, -1);
  const gridStart = addDays(first, -weekdayOf(first));
  const gridEnd = addDays(last, 6 - weekdayOf(last));

  const supabase = await createClient();
  const [items, { data: clients }, { data: me }] = await Promise.all([
    loadAgenda(supabase, user.id, gridStart, gridEnd),
    supabase.from("clients").select("id, name").eq("photographer_id", user.id).order("name"),
    supabase.from("profiles").select("calendar_token").eq("id", user.id).maybeSingle(),
  ]);

  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);
  const inMonth = items.filter((i) => i.day.startsWith(month));
  const feedUrl = me?.calendar_token ? `${APP_URL}/api/calendar/${me.calendar_token}.ics` : null;

  return (
    <VStack gap={6}>
      <PageHeader
        title="Calendrier"
        description={monthLabel(first)}
        actions={
          <HStack gap={2} align="center" wrap="wrap">
            <HStack gap={1} align="center">
              <Button
                label="Mois précédent"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<ChevronLeft size={16} strokeWidth={2} aria-hidden />}
                href={`/studio/calendrier?mois=${shiftMonth(month, -1)}`}
              />
              <Button label="Aujourd'hui" variant="ghost" size="sm" href="/studio/calendrier" />
              <Button
                label="Mois suivant"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<ChevronRight size={16} strokeWidth={2} aria-hidden />}
                href={`/studio/calendrier?mois=${shiftMonth(month, 1)}`}
              />
            </HStack>
            {feedUrl && <CalendarSyncDialog feedUrl={feedUrl} />}
            <NewEventDialog clients={(clients ?? []) as { id: string; name: string }[]} defaultDay={month === now.slice(0, 7) ? now : first} />
          </HStack>
        }
      />

      <div className="lp-cal-wrap">
        <section className="lp-cal" aria-label={`Calendrier, ${monthLabel(first)}`}>
          {WEEKDAYS.map((w) => (
            <div key={w} className="lp-cal-head">
              {w}
            </div>
          ))}
          {days.map((day) => {
            const dayItems = items.filter((i) => i.day === day);
            const outside = !day.startsWith(month);
            return (
              <div
                key={day}
                className="lp-cal-day"
                data-outside={outside ? "" : undefined}
                data-today={day === now ? "" : undefined}
                aria-label={`${longDay(day)}${outside ? ", hors du mois" : ""}${day === now ? ", aujourd'hui" : ""}`}
                role="group"
              >
                <span className="lp-cal-num" aria-hidden>
                  {Number(day.slice(8))}
                </span>
                {dayItems.map((item) => (
                  <Chip key={item.id} item={item} />
                ))}
              </div>
            );
          })}
        </section>

        <div className="lp-cal-list">
          <Card padding={inMonth.length > 0 ? 1 : undefined}>
            {inMonth.length > 0 ? (
              <AgendaList items={inMonth} />
            ) : (
              <EmptyState
                isCompact
                headingLevel={2}
                icon={<CalendarDays size={28} strokeWidth={1.5} />}
                title="Rien ce mois-ci"
                description="Ajoutez un rendez-vous ou une date d'événement à un client."
              />
            )}
          </Card>
        </div>
      </div>
    </VStack>
  );
}
