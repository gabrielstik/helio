import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { PageHeader } from "@/components/PageHeader";
import { TopShell } from "@/components/TopShell";
import { getSessionUser, isAdminEmail } from "@/lib/auth";
import { createAdminClient, hasSecretKey } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Back-office", robots: { index: false, follow: false } };

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card padding={5}>
      <VStack gap={1}>
        <Text type="supporting">{label}</Text>
        <Text type="display-3" hasTabularNumbers>
          {value.toLocaleString("fr-FR")}
        </Text>
      </VStack>
    </Card>
  );
}

/** Back-office : réservé aux e-mails de ADMIN_EMAILS. */
export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || !isAdminEmail(user.email)) notFound();

  // Les chiffres de toute la plateforme passent outre la RLS : sans une vraie clé secrète, on le dit au lieu
  // de planter ou d'afficher des zéros (une clé publishable répond 0 sous RLS, une clé révoquée échoue).
  const results = hasSecretKey()
    ? await Promise.all([
        createAdminClient().from("profiles").select("id", { count: "exact", head: true }).eq("role", "photographer"),
        createAdminClient().from("clients").select("id", { count: "exact", head: true }),
        createAdminClient().from("galleries").select("id", { count: "exact", head: true }),
      ])
    : null;
  const counts = results?.every((r) => !r.error && r.count !== null) ? results.map((r) => r.count ?? 0) : null;

  return (
    <TopShell
      label="Back-office"
      home="/admin"
      email={user.email}
      links={[
        { href: "/admin", label: "Vue d'ensemble" },
        { href: "/studio", label: "Studio" },
      ]}
    >
      <div className="lp-capped">
        <VStack gap={6}>
          <PageHeader title="Back-office" description="L'activité de toute la plateforme." />
          {counts ? (
            <div className="lp-gallery-grid">
              <Kpi label="Photographes" value={counts[0]} />
              <Kpi label="Clients suivis" value={counts[1]} />
              <Kpi label="Galeries" value={counts[2]} />
            </div>
          ) : results ? (
            <Banner
              status="error"
              title="Supabase refuse la clé secrète"
              description="SUPABASE_SECRET_KEY est renseignée mais les requêtes échouent : vérifiez qu'elle est active et qu'elle appartient bien à ce projet."
            />
          ) : (
            <Banner
              status="warning"
              title="Clé secrète Supabase manquante"
              description="Ajoutez SUPABASE_SECRET_KEY (Supabase → Settings → API Keys → Secret keys, elle commence par sb_secret_) dans .env.local en local et dans les variables du projet Vercel, puis redéployez."
            />
          )}
        </VStack>
      </div>
    </TopShell>
  );
}
