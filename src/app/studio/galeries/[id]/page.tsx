import { notFound } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { BreadcrumbItem, Breadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Link } from "@astryxdesign/core/Link";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { PageHeader } from "@/components/PageHeader";
import { GALLERY_STATUS, plural, type GalleryStatus } from "@/lib/labels";
import { APP_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

interface GalleryRow {
  id: string;
  title: string;
  slug: string;
  status: GalleryStatus;
  allow_downloads: boolean;
  access_password_hash: string | null;
}

export async function generateMetadata({ params }: PageProps<"/studio/galeries/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("galleries").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? "Galerie" };
}

/** Une galerie côté photographe : photos, ordre, accès et apparence (à venir). */
export default async function GalleryPage({ params }: PageProps<"/studio/galeries/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { count }] = await Promise.all([
    supabase.from("galleries").select("id, title, slug, status, allow_downloads, access_password_hash").eq("id", id).maybeSingle(),
    supabase.from("photos").select("id", { count: "exact", head: true }).eq("gallery_id", id),
  ]);
  if (!data) notFound();
  const gallery = data as GalleryRow;
  const status = GALLERY_STATUS[gallery.status];
  const guestUrl = `${APP_URL}/g/${gallery.slug}`;

  return (
    <VStack gap={6}>
      <PageHeader
        above={
          <Breadcrumbs variant="supporting">
            <BreadcrumbItem href="/studio/galeries">Galeries</BreadcrumbItem>
            <BreadcrumbItem isCurrent>{gallery.title}</BreadcrumbItem>
          </Breadcrumbs>
        }
        title={gallery.title}
        description={plural(count ?? 0, "photo", "photos")}
      />
      <Card>
        <MetadataList title={<Text weight="semibold">Accès</Text>}>
          <MetadataListItem label="Statut">
            <HStack gap={2} align="center">
              <StatusDot variant={status.dot} label={status.label} />
              <Text>{status.label}</Text>
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Lien invité">
            {gallery.status === "published" ? (
              <Link href={guestUrl} isExternalLink>
                {guestUrl}
              </Link>
            ) : (
              <Text color="secondary">Disponible une fois la galerie publiée</Text>
            )}
          </MetadataListItem>
          <MetadataListItem label="Mot de passe">
            <Text>{gallery.access_password_hash ? "Demandé aux invités" : "Aucun"}</Text>
          </MetadataListItem>
          <MetadataListItem label="Téléchargements">
            <Text>{gallery.allow_downloads ? "Autorisés" : "Désactivés"}</Text>
          </MetadataListItem>
        </MetadataList>
      </Card>
      {!count && (
        <EmptyState
          icon={<ImagePlus size={32} strokeWidth={1.5} />}
          title="Pas encore de photos"
          description="L'envoi des photos arrive bientôt : vous pourrez les déposer ici et choisir leur ordre."
        />
      )}
    </VStack>
  );
}
