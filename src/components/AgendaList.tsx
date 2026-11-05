import { List, ListItem } from "@astryxdesign/core/List";
import { Text } from "@astryxdesign/core/Text";
import type { AgendaItem } from "@/lib/agenda";
import { shortDay, shortMonth } from "@/lib/dates";

/** Pastille de date : le jour en gros, le mois dessous. */
function DateChip({ day }: { day: string }) {
  return (
    <span className="lp-date-chip" aria-hidden>
      <span className="lp-date-chip-day">{Number(day.slice(8))}</span>
      <span className="lp-date-chip-month">{shortMonth(day)}</span>
    </span>
  );
}

/** « Mariage · Camille Martin », puis « jeu. 12 nov. · 14:00 · Lieu ». */
export function AgendaList({ items }: { items: AgendaItem[] }) {
  return (
    <List hasDividers>
      {items.map((item) => (
        <ListItem
          key={item.id}
          label={item.client ? `${item.title} · ${item.client}` : item.title}
          description={[shortDay(item.day), item.time ?? "Journée", item.location].filter(Boolean).join(" · ")}
          startContent={<DateChip day={item.day} />}
          endContent={
            <Text type="supporting" color="secondary">
              {item.kind === "shooting" ? "Shooting" : "Rendez-vous"}
            </Text>
          }
        />
      ))}
    </List>
  );
}
