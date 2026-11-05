import { Images, SquareKanban, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Logo } from "@/components/Logo";
import { PRODUCT_NAME } from "@/lib/site";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: SquareKanban,
    title: "Un CRM en kanban",
    text: "Chaque client avance de colonne en colonne, du premier contact au shooting, puis à la livraison.",
  },
  {
    icon: Images,
    title: "Des galeries à votre image",
    text: "Partagez vos photos par lien, QR code ou mot de passe, avec vos couleurs et votre logo.",
  },
  {
    icon: UserRound,
    title: "Un espace pour vos clients",
    text: "Devis, contrat, factures et galeries : vos clients retrouvent tout au même endroit.",
  },
];

export default function Home() {
  return (
    <>
      <header className="lp-site-header">
        <div className="lp-page">
          <HStack justify="between" align="center" gap={4}>
            <HStack gap={2} align="center">
              <Logo size={28} />
              <Text weight="semibold" size="lg">
                {PRODUCT_NAME}
              </Text>
            </HStack>
            <Button label="Se connecter" variant="secondary" size="sm" href="/login" />
          </HStack>
        </div>
      </header>
      <main className="lp-page">
        <section className="lp-hero">
          <VStack gap={5} align="center">
            <Heading level={1} type="display-2" justify="center" textWrap="balance">
              Vos clients et vos galeries, au même endroit.
            </Heading>
            <Text type="large" color="secondary" justify="center" textWrap="pretty">
              Le CRM et les galeries clients du photographe, dans une seule app : moins d&apos;outils, plus de temps
              derrière l&apos;objectif.
            </Text>
            <Button label="Accéder à mon studio" variant="primary" size="lg" href="/login" />
          </VStack>
        </section>
        <section className="lp-features" aria-label="Fonctionnalités">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title} padding={5}>
              <VStack gap={3}>
                <span className="lp-feature-icon">
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                </span>
                <VStack gap={1}>
                  <Heading level={4} accessibilityLevel={2}>
                    {title}
                  </Heading>
                  <Text color="secondary">{text}</Text>
                </VStack>
              </VStack>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
