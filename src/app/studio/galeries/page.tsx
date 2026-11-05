import type { Metadata } from "next";
import { Images } from "lucide-react";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { VStack } from "@astryxdesign/core/Stack";
import { GalleryCard } from "@/components/GalleryCard";
import { PageHeader } from "@/components/PageHeader";
import { plural, type GalleryStatus } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Galeries" };

interface GalleryRow {
  id: string;
  title: string;
  slug: string;
  status: GalleryStatus;
}

/**
 * Galeries du photographe.
 * À venir : création, envoi des photos (bucket « photos »), ordre, personnalisation,
 * mot de passe, lien et QR code, import depuis d'autres services.
 */
export default async function GalleriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("galleries").select("id, title, slug, status").order("created_at", { ascending: false });
  const galleries = (data ?? []) as GalleryRow[];

  return (
    <VStack gap={6}>
      <PageHeader
        title="Galeries"
        description={galleries.length > 0 ? plural(galleries.length, "galerie", "galeries") : "Les photos que vous livrez à vos clients."}
      />
      {galleries.length === 0 ? (
        <EmptyState
          icon={<Images size={32} strokeWidth={1.5} />}
          title="Aucune galerie pour l'instant"
          description="Les galeries que vous préparez pour vos clients apparaîtront ici, avec leur lien de partage."
        />
      ) : (
        <div className="lp-gallery-grid">
          {galleries.map((g) => (
            <GalleryCard key={g.id} title={g.title} href={`/studio/galeries/${g.id}`} status={g.status} detail={`/g/${g.slug}`} />
          ))}
        </div>
      )}
    </VStack>
  );
}
