import { createClient } from "@/lib/supabase/server";

interface Stage {
  id: string;
  name: string;
  position: number;
  unlocks_gallery: boolean;
}

interface ClientCard {
  id: string;
  stage_id: string | null;
  name: string;
  event_date: string | null;
}

/**
 * Kanban du CRM : une colonne par étape (pipeline_stages), une carte par client.
 * À venir : glisser-déposer, fiche client, devis / contrat / facture, formulaire de contact,
 * prospects détectés dans la boîte mail, brouillons d'e-mails.
 */
export default async function CrmPage() {
  const supabase = await createClient();
  const [{ data: stages }, { data: clients }] = await Promise.all([
    supabase.from("pipeline_stages").select("id, name, position, unlocks_gallery").order("position"),
    supabase.from("clients").select("id, stage_id, name, event_date").order("position"),
  ]);

  return (
    <main>
      <h1>CRM</h1>
      <div className="kanban">
        {((stages ?? []) as Stage[]).map((stage) => {
          const cards = ((clients ?? []) as ClientCard[]).filter((c) => c.stage_id === stage.id);
          return (
            <section key={stage.id} className="kanban-column">
              <h2>
                <span>{stage.name}</span>
                <span className="muted">{cards.length}</span>
              </h2>
              {stage.unlocks_gallery && <p className="muted">Les galeries de ces clients sont visibles.</p>}
              {cards.map((c) => (
                <div key={c.id} className="card">
                  <strong>{c.name}</strong>
                  {c.event_date && <div className="muted">{c.event_date}</div>}
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
