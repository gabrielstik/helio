import { TopShell } from "@/components/TopShell";
import { requireRole } from "@/lib/auth";

/** Espace du client (« administrateur ») : devis, contrat, dates, notes, factures, galeries. */
export default async function EspaceLayout({ children }: LayoutProps<"/espace">) {
  const { user } = await requireRole("client", "/espace");
  return (
    <TopShell label="Espace client" home="/espace" email={user.email} links={[{ href: "/espace", label: "Mon espace" }]}>
      {children}
    </TopShell>
  );
}
