import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, FileSignature, ImagePlus, MessageSquare } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { List, ListItem } from "@astryxdesign/core/List";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { AgendaList } from "@/components/AgendaList";
import { PageHeader } from "@/components/PageHeader";
import { loadAgenda } from "@/lib/agenda";
import { getSessionUser } from "@/lib/auth";
import { addDays, dayOf, longDay, today } from "@/lib/dates";
import { DOCUMENT_KIND, plural, type DocumentKind } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { MarkNoteReadButton } from "./MarkNoteReadButton";

export const metadata: Metadata = { title: "Vue d'ensemble" };

/** Un devis ou un contrat envoyé depuis plus longtemps que ça, sans signature, est à relancer. */
const FOLLOW_UP_DAYS = 7;

const EUROS = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

interface DocumentRow {
  id: string;
  kind: DocumentKind;
  number: string | null;
  amount_cents: number | null;
  sent_at: string | null;
  clients: { name: string } | null;
}

interface NoteRow {
  id: string;
  body: string;
  clients: { name: string } | null;
}

function Kpi({ label, value, detail, href }: { label: string; value: string; detail: string; href: string }) {
  return (
    // Le libellé devient le nom du lien pour les lecteurs d'écran : il porte donc aussi le chiffre.
    <ClickableCard label={`${label} : ${value}, ${detail}`} href={href} padding={4}>
      <VStack gap={1}>
        <Text type="supporting">{label}</Text>
        <Text type="display-3" hasTabularNumbers>
          {value}
        </Text>
        <Text type="supporting">{detail}</Text>
      </VStack>
    </ClickableCard>
  );
}

/**
 * Accueil du studio : les chiffres qui comptent, les deux semaines à venir et ce qui attend le photographe
 * (notes de clients non lues, devis et contrats à relancer, galeries pas encore publiées).
 */
export default async function OverviewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/studio");
  const supabase = await createClient();
  const now = today();
  // Chaque requête est filtrée par propriétaire en plus de la RLS, qui laisse aussi lire, comme client, les lignes d'un autre studio.
  const [{ data: me }, { data: stages }, { data: clients }, { data: documents }, { data: notes }, { count: drafts }, agenda] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("pipeline_stages").select("id, name, position").eq("photographer_id", user.id).order("position"),
    supabase.from("clients").select("id, stage_id").eq("photographer_id", user.id),
    supabase
      .from("documents")
      .select("id, kind, number, amount_cents, sent_at, clients(name)")
      .eq("photographer_id", user.id)
      .eq("status", "sent")
      .order("sent_at"),
    supabase
      .from("client_notes")
      .select("id, body, clients(name)")
      .eq("photographer_id", user.id)
      .neq("author_id", user.id)
      .is("read_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("galleries").select("id", { count: "exact", head: true }).eq("photographer_id", user.id).eq("status", "draft"),
    loadAgenda(supabase, user.id, now, addDays(now, 29)),
  ]);

  const stageList = (stages ?? []) as { id: string; name: string; position: number }[];
  const lastStage = stageList.at(-1)?.id;
  const clientRows = (clients ?? []) as { id: string; stage_id: string | null }[];
  const active = clientRows.filter((c) => c.stage_id !== lastStage).length;
  const sent = (documents ?? []) as unknown as DocumentRow[];
  const toSign = sent.filter((d) => d.kind !== "invoice");
  const unpaid = sent.filter((d) => d.kind === "invoice");
  const unpaidTotal = unpaid.reduce((sum, d) => sum + (d.amount_cents ?? 0), 0);
  const followUps = toSign.filter((d) => d.sent_at && dayOf(d.sent_at) < addDays(now, -FOLLOW_UP_DAYS));
  // Les notes que le photographe a écrites lui-même ne sont pas « à lire » (filtrées par author_id).
  const unread = (notes ?? []) as unknown as NoteRow[];
  const shootings = agenda.filter((a) => a.kind === "shooting").length;
  const soon = agenda.filter((a) => a.day <= addDays(now, 13));
  const firstName = me?.full_name?.trim().split(/\s+/)[0];

  const todos: { id: string; icon: React.ReactNode; label: string; description: string; href?: string; action?: React.ReactNode }[] = [
    ...unread.map((n) => ({
      id: `note-${n.id}`,
      icon: <MessageSquare size={18} strokeWidth={1.75} aria-hidden />,
      label: `Note de ${n.clients?.name ?? "un client"}`,
      description: n.body,
      action: <MarkNoteReadButton noteId={n.id} />,
    })),
    ...followUps.map((d) => ({
      id: `doc-${d.id}`,
      icon: <FileSignature size={18} strokeWidth={1.75} aria-hidden />,
      label: `Relancer ${d.clients?.name ?? "le client"}`,
      description: `${DOCUMENT_KIND[d.kind]}${d.number ? ` n° ${d.number}` : ""} envoyé il y a plus de ${FOLLOW_UP_DAYS} jours, pas encore signé`,
      href: "/studio/crm",
    })),
    ...(drafts
      ? [
          {
            id: "drafts",
            icon: <ImagePlus size={18} strokeWidth={1.75} aria-hidden />,
            label: `${plural(drafts, "galerie", "galeries")} en brouillon`,
            description: "À publier une fois les photos prêtes.",
            href: "/studio/galeries",
          },
        ]
      : []),
  ];

  return (
    <VStack gap={8}>
      <PageHeader title={firstName ? `Bonjour ${firstName}` : "Bonjour"} description={`On est ${longDay(now)}.`} />

      <div className="lp-kpi-grid">
        <Kpi label="Clients en cours" value={String(active)} detail="hors colonne finale" href="/studio/crm" />
        <Kpi label="Shootings à venir" value={String(shootings)} detail="dans les 30 jours" href="/studio/calendrier" />
        <Kpi label="À signer" value={String(toSign.length)} detail="devis et contrats envoyés" href="/studio/crm" />
        <Kpi label="Factures impayées" value={EUROS.format(unpaidTotal / 100)} detail={plural(unpaid.length, "facture", "factures")} href="/studio/crm" />
      </div>

      <div className="lp-overview-grid">
        <VStack gap={3}>
          <HStack justify="between" align="center" gap={3}>
            <Heading level={2}>Les deux semaines à venir</Heading>
            <Button label="Calendrier" variant="ghost" size="sm" href="/studio/calendrier" icon={<CalendarDays size={16} strokeWidth={1.75} aria-hidden />} />
          </HStack>
          <Card padding={soon.length > 0 ? 1 : undefined}>
            {soon.length > 0 ? (
              <AgendaList items={soon} />
            ) : (
              <EmptyState
                isCompact
                headingLevel={3}
                icon={<CalendarDays size={28} strokeWidth={1.5} />}
                title="Rien de prévu"
                description="Les rendez-vous et les jours de shooting de vos clients apparaîtront ici."
              />
            )}
          </Card>
        </VStack>

        <VStack gap={6}>
          <VStack gap={3}>
            <Heading level={2}>À faire</Heading>
            <Card padding={todos.length > 0 ? 1 : undefined}>
              {todos.length > 0 ? (
                <List hasDividers>
                  {todos.map((t) => (
                    <ListItem key={t.id} label={t.label} description={t.description} startContent={t.icon} href={t.href} endContent={t.action} />
                  ))}
                </List>
              ) : (
                <EmptyState
                  isCompact
                  headingLevel={3}
                  icon={<CheckCircle2 size={28} strokeWidth={1.5} />}
                  title="Tout est à jour"
                  description="Aucune note à lire, aucun devis à relancer."
                />
              )}
            </Card>
          </VStack>

          {stageList.length > 0 && (
            <VStack gap={3}>
              <Heading level={2}>Pipeline</Heading>
              <Card padding={1}>
                <List hasDividers density="compact">
                  {stageList.map((s) => (
                    <ListItem
                      key={s.id}
                      label={s.name}
                      href="/studio/crm"
                      endContent={
                        <Text type="supporting" hasTabularNumbers>
                          {clientRows.filter((c) => c.stage_id === s.id).length}
                        </Text>
                      }
                    />
                  ))}
                </List>
              </Card>
            </VStack>
          )}
        </VStack>
      </div>
    </VStack>
  );
}
