"use client";

import { usePathname } from "next/navigation";
import { Images, ShieldCheck, SquareKanban, type LucideIcon } from "lucide-react";
import { AppShell } from "@astryxdesign/core/AppShell";
import { Avatar } from "@astryxdesign/core/Avatar";
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from "@astryxdesign/core/SideNav";
import { HStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { PRODUCT_NAME } from "@/lib/site";

interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const STUDIO_LINKS: NavLink[] = [
  { label: "CRM", href: "/studio/crm", icon: SquareKanban },
  { label: "Galeries", href: "/studio/galeries", icon: Images },
];

function Item({ link, pathname }: { link: NavLink; pathname: string }) {
  const Icon = link.icon;
  return (
    <SideNavItem
      label={link.label}
      href={link.href}
      icon={<Icon size={16} strokeWidth={1.75} aria-hidden />}
      isSelected={pathname === link.href || pathname.startsWith(`${link.href}/`)}
    />
  );
}

/**
 * Cadre de l'espace photographe : la navigation à gauche (un tiroir sur téléphone, géré par
 * AppShell), le compte et la déconnexion en pied de barre.
 */
export function StudioShell({
  email,
  studioName,
  isAdmin,
  children,
}: {
  email: string | null;
  studioName: string | null;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const account = email ?? "Compte";

  return (
    <AppShell
      contentPadding={6}
      sideNav={
        <SideNav
          aria-label="Studio"
          header={<SideNavHeading icon={<Logo size={24} />} heading={PRODUCT_NAME} subheading={studioName ?? "Studio"} headingHref="/studio/crm" />}
          footer={
            <HStack gap={2} align="center" justify="between">
              <HStack gap={2} align="center">
                <Avatar name={account} size="sm" tooltip={false} />
                <Text type="supporting" maxLines={1}>
                  {account}
                </Text>
              </HStack>
              <SignOutButton isIconOnly />
            </HStack>
          }
        >
          <SideNavSection title="Studio" isHeaderHidden>
            {STUDIO_LINKS.map((link) => (
              <Item key={link.href} link={link} pathname={pathname} />
            ))}
          </SideNavSection>
          {isAdmin && (
            <SideNavSection title="Équipe">
              <Item link={{ label: "Back-office", href: "/admin", icon: ShieldCheck }} pathname={pathname} />
            </SideNavSection>
          )}
        </SideNav>
      }
    >
      {children}
    </AppShell>
  );
}
