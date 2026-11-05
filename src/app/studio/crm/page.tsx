import type { Metadata } from "next";
import { VStack } from "@astryxdesign/core/Stack";
import { CrmBoard, type ClientCard, type Stage } from "@/components/CrmBoard";
import { PageHeader } from "@/components/PageHeader";
import { plural } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "CRM" };

/**
 * Kanban du CRM : une colonne par étape (pipeline_stages), une carte par client.
 * À venir : glisser-déposer, fiche client, devis / contrat / facture, formulaire de contact,
 * prospects détectés dans la boîte mail, brouillons d'e-mails.
 */
export default async function CrmPage() {
  const supabase = await createClient();
  const [{ data: stages }, { data: clients }] = await Promise.all([
    supabase.from("pipeline_stages").select("id, name, position, unlocks_gallery").order("position"),
    supabase.from("clients").select("id, stage_id, name, event_type, event_date").order("position"),
  ]);

  return (
    <VStack gap={6}>
      <PageHeader title="CRM" description={`${plural(clients?.length ?? 0, "client", "clients")}, du premier contact à la livraison.`} />
      <CrmBoard stages={(stages ?? []) as Stage[]} clients={(clients ?? []) as ClientCard[]} />
    </VStack>
  );
}
