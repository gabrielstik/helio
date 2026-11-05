import { Eye } from "lucide-react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import { formatDay } from "@/lib/labels";

export interface Stage {
  id: string;
  name: string;
  position: number;
  unlocks_gallery: boolean;
}

export interface ClientCard {
  id: string;
  stage_id: string | null;
  name: string;
  event_type: string | null;
  event_date: string | null;
}

function ClientCardView({ client }: { client: ClientCard }) {
  const details = [client.event_type, client.event_date && formatDay(client.event_date)].filter(Boolean).join(" · ");
  return (
    <Card padding={3}>
      <HStack gap={2} align="start">
        <Avatar name={client.name} size="sm" tooltip={false} />
        <VStack gap={0.5}>
          <Text weight="semibold" maxLines={1}>
            {client.name}
          </Text>
          {details && <Text type="supporting">{details}</Text>}
        </VStack>
      </HStack>
    </Card>
  );
}

/** Le kanban : une colonne par étape, les cartes dans l'ordre de `clients`. Défile à l'horizontale. */
export function CrmBoard({ stages, clients }: { stages: Stage[]; clients: ClientCard[] }) {
  return (
    <div className="lp-board">
      {stages.map((stage) => {
        const cards = clients.filter((c) => c.stage_id === stage.id);
        return (
          <section key={stage.id} className="lp-board-column" aria-label={stage.name}>
            <Card variant="muted" padding={3}>
              <VStack gap={3}>
                <VStack gap={2}>
                  <HStack justify="between" align="center" gap={2}>
                    <Heading level={4} accessibilityLevel={2} maxLines={1}>
                      {stage.name}
                    </Heading>
                    <Text type="supporting" hasTabularNumbers>
                      {cards.length}
                    </Text>
                  </HStack>
                  {stage.unlocks_gallery && (
                    <HStack>
                      <Token
                        size="sm"
                        color="green"
                        label="Galeries visibles"
                        icon={<Eye size={12} aria-hidden />}
                        description="Les clients de cette colonne voient leurs galeries publiées."
                      />
                    </HStack>
                  )}
                </VStack>
                <div className="lp-board-cards">
                  {cards.length > 0 ? (
                    cards.map((c) => <ClientCardView key={c.id} client={c} />)
                  ) : (
                    <div className="lp-board-empty">
                      <Text type="supporting">Aucun client</Text>
                    </div>
                  )}
                </div>
              </VStack>
            </Card>
          </section>
        );
      })}
    </div>
  );
}
