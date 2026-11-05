import { notFound } from "next/navigation";
import { Images, LockKeyhole } from "lucide-react";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

/** Le titre seul : une galerie invitée ne doit pas être indexée. */
export async function generateMetadata({ params }: PageProps<"/g/[slug]">) {
  const { slug } = await params;
  if (!supabaseConfigured || !process.env.SUPABASE_SECRET_KEY) return { robots: { index: false } };
  const { data } = await createAdminClient().from("galleries").select("title").eq("slug", slug).eq("status", "published").maybeSingle();
  return { title: data?.title ?? "Galerie", robots: { index: false, follow: false } };
}

/**
 * Galerie côté invité : pas de compte, accès par lien, QR code ou mot de passe.
 * L'invité ne lit jamais les tables : le serveur vérifie l'accès puis lit avec la clé secrète.
 * À venir : mot de passe, diaporama, téléchargement, recherche par visage, boutique.
 */
export default async function GuestGalleryPage({ params }: PageProps<"/g/[slug]">) {
  const { slug } = await params;
  if (!supabaseConfigured || !process.env.SUPABASE_SECRET_KEY) notFound();

  const { data: gallery } = await createAdminClient()
    .from("galleries")
    .select("id, title, status, access_password_hash")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!gallery) notFound();

  return (
    <main className="lp-page">
      <VStack gap={8} paddingBlock={10}>
        <VStack gap={2} align="center">
          <Text type="supporting">Galerie</Text>
          <Heading level={1} type="display-3" justify="center" textWrap="balance">
            {gallery.title}
          </Heading>
        </VStack>
        {gallery.access_password_hash ? (
          <EmptyState
            icon={<LockKeyhole size={32} strokeWidth={1.5} />}
            title="Galerie protégée"
            description="Cette galerie demande un mot de passe. Votre photographe vous l'a transmis avec le lien."
          />
        ) : (
          <EmptyState
            icon={<Images size={32} strokeWidth={1.5} />}
            title="Les photos arrivent"
            description="Votre photographe prépare cette galerie. Revenez bientôt sur ce lien."
          />
        )}
      </VStack>
    </main>
  );
}
