import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/**
 * Accueil de l'espace client. La RLS ne lui renvoie que ses propres lignes :
 * documents envoyés, galeries publiées et débloquées.
 * À venir : rendez-vous, notes au photographe, paiement, favoris et photos masquées.
 */
export default async function EspacePage() {
  const supabase = await createClient();
  const [{ data: documents }, { data: galleries }] = await Promise.all([
    supabase.from("documents").select("id, kind, status, number").order("created_at", { ascending: false }),
    supabase.from("galleries").select("id, title, slug"),
  ]);

  return (
    <main>
      <h1>Mon espace</h1>
      <section className="card">
        <h2>Devis, contrat et factures</h2>
        {(documents ?? []).length === 0 ? <p className="muted">Rien pour l&apos;instant.</p> : null}
        <ul>
          {(documents ?? []).map((d) => (
            <li key={d.id}>
              {d.kind} {d.number ?? ""} · {d.status}
            </li>
          ))}
        </ul>
      </section>
      <section className="card" style={{ marginTop: 12 }}>
        <h2>Mes galeries</h2>
        {(galleries ?? []).length === 0 ? <p className="muted">Votre galerie apparaîtra ici une fois prête.</p> : null}
        <ul>
          {(galleries ?? []).map((g) => (
            <li key={g.id}>
              <Link href={`/g/${g.slug}`}>{g.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
