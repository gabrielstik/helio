import { Heading } from "@astryxdesign/core/Heading";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

/** Titre de page (le h1 de l'espace), une ligne d'explication et l'action principale à droite. */
export function PageHeader({
  title,
  description,
  above,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Au-dessus du titre : fil d'Ariane. */
  above?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <VStack gap={3}>
      {above}
      <HStack justify="between" align="start" gap={4} wrap="wrap">
        <VStack gap={1}>
          <Heading level={1}>{title}</Heading>
          {description && <Text color="secondary">{description}</Text>}
        </VStack>
        {actions}
      </HStack>
    </VStack>
  );
}
