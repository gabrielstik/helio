import { StudioShell } from "@/components/StudioShell";
import { isAdminEmail, requireRole } from "@/lib/auth";

/** Espace du photographe : CRM et galeries. */
export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const { user, profile } = await requireRole("photographer", "/studio");
  return (
    <StudioShell email={user.email} studioName={profile.studio_name} isAdmin={isAdminEmail(user.email)}>
      {children}
    </StudioShell>
  );
}
