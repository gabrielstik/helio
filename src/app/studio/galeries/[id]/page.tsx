import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Une galerie côté photographe : photos, ordre, accès et apparence (à venir). */
export default async function GalleryPage({ params }: PageProps<"/studio/galeries/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: gallery } = await supabase.from("galleries").select("id, title, slug, status").eq("id", id).maybeSingle();
  if (!gallery) notFound();

  return (
    <main>
      <h1>{gallery.title}</h1>
      <p className="muted">
        {gallery.status} · lien invité : /g/{gallery.slug}
      </p>
    </main>
  );
}
