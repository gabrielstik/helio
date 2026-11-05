"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@astryxdesign/core/AppShell";
import { HStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { PRODUCT_NAME } from "@/lib/site";

/**
 * Cadre à barre du haut, pour les espaces qui ont peu de pages : l'espace client et le back-office.
 * Le studio, qui en aura beaucoup, a sa barre latérale (StudioShell).
 */
export function TopShell({
  label,
  home,
  links,
  email,
  children,
}: {
  /** Nom de la navigation pour les lecteurs d'écran. */
  label: string;
  home: string;
  links: { href: string; label: string }[];
  email: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AppShell
      contentPadding={6}
      topNav={
        <TopNav
          label={label}
          heading={<TopNavHeading logo={<Logo size={24} />} heading={PRODUCT_NAME} headingHref={home} />}
          startContent={links.map((l) => (
            <TopNavItem key={l.href} label={l.label} href={l.href} isSelected={pathname === l.href} />
          ))}
          endContent={
            <HStack gap={3} align="center">
              {email && (
                <Text type="supporting" maxLines={1}>
                  {email}
                </Text>
              )}
              <SignOutButton />
            </HStack>
          }
        />
      }
    >
      {children}
    </AppShell>
  );
}
