import { notFound } from "next/navigation";
import { getSessionUser, isAdminEmail } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Back-office : réservé aux e-mails de ADMIN_EMAILS. */
export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) notFound();

  const db = createAdminClient();
  const [photographers, galleries] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "photographer"),
    db.from("galleries").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main>
      <h1>Back-office</h1>
      <div className="grid">
        <div className="card">
          <div className="muted">Photographes</div>
          <strong>{photographers.count ?? 0}</strong>
        </div>
        <div className="card">
          <div className="muted">Galeries</div>
          <strong>{galleries.count ?? 0}</strong>
        </div>
      </div>
    </main>
  );
}
