import { TopBar } from "@/components/TopBar";
import { requireRole } from "@/lib/auth";

/** Espace du photographe : CRM et galeries. */
export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const { user } = await requireRole("photographer", "/studio/crm");
  return (
    <>
      <TopBar
        email={user.email}
        links={[
          { href: "/studio/crm", label: "CRM" },
          { href: "/studio/galeries", label: "Galeries" },
        ]}
      />
      {children}
    </>
  );
}
