import { notFound } from "next/navigation";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

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
    <main>
      <h1>{gallery.title}</h1>
      {gallery.access_password_hash ? (
        <p className="muted">Cette galerie est protégée par un mot de passe.</p>
      ) : (
        <p className="muted">Les photos s&apos;afficheront ici.</p>
      )}
    </main>
  );
}
