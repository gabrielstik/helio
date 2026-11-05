import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { PageHeader } from "@/components/PageHeader";
import { TopShell } from "@/components/TopShell";
import { getSessionUser, isAdminEmail } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const db = createAdminClient();
  const [photographers, clients, galleries] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "photographer"),
    db.from("clients").select("id", { count: "exact", head: true }),
    db.from("galleries").select("id", { count: "exact", head: true }),
  ]);

  return (
    <TopShell
      label="Back-office"
      home="/admin"
      email={user.email}
      links={[
        { href: "/admin", label: "Vue d'ensemble" },
        { href: "/studio/crm", label: "Studio" },
      ]}
    >
      <div className="lp-capped">
        <VStack gap={6}>
          <PageHeader title="Back-office" description="L'activité de toute la plateforme." />
          <div className="lp-gallery-grid">
            <Kpi label="Photographes" value={photographers.count ?? 0} />
            <Kpi label="Clients suivis" value={clients.count ?? 0} />
            <Kpi label="Galeries" value={galleries.count ?? 0} />
          </div>
        </VStack>
      </div>
    </TopShell>
  );
}
