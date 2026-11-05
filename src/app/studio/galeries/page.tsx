import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface GalleryRow {
  id: string;
  title: string;
  slug: string;
  status: string;
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
    <main>
      <h1>Galeries</h1>
      {galleries.length === 0 ? (
        <p className="muted">Aucune galerie pour l&apos;instant.</p>
      ) : (
        <div className="grid">
          {galleries.map((g) => (
            <Link key={g.id} href={`/studio/galeries/${g.id}`} className="card">
              <strong>{g.title}</strong>
              <div className="muted">
                {g.status} · /g/{g.slug}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
