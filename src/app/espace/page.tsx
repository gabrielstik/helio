import type { Metadata } from "next";
import { FileText, Images } from "lucide-react";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { List, ListItem } from "@astryxdesign/core/List";
import { VStack } from "@astryxdesign/core/Stack";
import { Token } from "@astryxdesign/core/Token";
import { GalleryCard } from "@/components/GalleryCard";
import { PageHeader } from "@/components/PageHeader";
import { DOCUMENT_KIND, DOCUMENT_STATUS, type DocumentKind, type DocumentStatus } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mon espace" };

interface DocumentRow {
  id: string;
  kind: DocumentKind;
  status: DocumentStatus;
  number: string | null;
}

interface GalleryRow {
  id: string;
  title: string;
  slug: string;
}

/**
 * Accueil de l'espace client. La RLS ne lui renvoie que ses propres lignes :
 * documents envoyés, galeries publiées et débloquées.
 * À venir : rendez-vous, notes au photographe, paiement, favoris et photos masquées.
 */
export default async function EspacePage() {
  const supabase = await createClient();
  const [{ data: documentRows }, { data: galleryRows }] = await Promise.all([
    supabase.from("documents").select("id, kind, status, number").order("created_at", { ascending: false }),
    supabase.from("galleries").select("id, title, slug"),
  ]);
  const documents = (documentRows ?? []) as DocumentRow[];
  const galleries = (galleryRows ?? []) as GalleryRow[];

  return (
    <div className="lp-capped">
      <VStack gap={8}>
        <PageHeader title="Mon espace" description="Vos documents et vos galeries, partagés par votre photographe." />

        <VStack gap={3}>
          <Heading level={2}>Devis, contrat et factures</Heading>
          <Card padding={documents.length > 0 ? 1 : undefined}>
            {documents.length === 0 ? (
              <EmptyState
                isCompact
                headingLevel={3}
                icon={<FileText size={28} strokeWidth={1.5} />}
                title="Rien pour l'instant"
                description="Votre devis et votre contrat apparaîtront ici dès que votre photographe vous les enverra."
              />
            ) : (
              <List hasDividers>
                {documents.map((d) => {
                  const status = DOCUMENT_STATUS[d.status];
                  return (
                    <ListItem
                      key={d.id}
                      label={d.number ? `${DOCUMENT_KIND[d.kind]} n° ${d.number}` : DOCUMENT_KIND[d.kind]}
                      startContent={<FileText size={18} strokeWidth={1.75} aria-hidden />}
                      endContent={<Token size="sm" color={status.color} label={status.label} />}
                    />
                  );
                })}
              </List>
            )}
          </Card>
        </VStack>

        <VStack gap={3}>
          <Heading level={2}>Mes galeries</Heading>
          {galleries.length === 0 ? (
            <Card>
              <EmptyState
                isCompact
                headingLevel={3}
                icon={<Images size={28} strokeWidth={1.5} />}
                title="Votre galerie arrive"
                description="Elle apparaîtra ici une fois prête et publiée par votre photographe."
              />
            </Card>
          ) : (
            <div className="lp-gallery-grid">
              {galleries.map((g) => (
                <GalleryCard key={g.id} title={g.title} href={`/g/${g.slug}`} />
              ))}
            </div>
          )}
        </VStack>
      </VStack>
    </div>
  );
}
