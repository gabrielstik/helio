import { TopBar } from "@/components/TopBar";
import { requireRole } from "@/lib/auth";

/** Espace du client (« administrateur ») : devis, contrat, dates, notes, factures, galeries. */
export default async function EspaceLayout({ children }: LayoutProps<"/espace">) {
  const { user } = await requireRole("client", "/espace");
  return (
    <>
      <TopBar email={user.email} links={[{ href: "/espace", label: "Mon espace" }]} />
      {children}
    </>
  );
}
