import { Images } from "lucide-react";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { GALLERY_STATUS, type GalleryStatus } from "@/lib/labels";

/** Vignette d'une galerie : couverture (un pictogramme tant qu'aucune photo n'est choisie), titre, statut. */
export function GalleryCard({
  title,
  href,
  status,
  detail,
}: {
  title: string;
  href: string;
  /** Absent côté client : il ne voit que des galeries publiées. */
  status?: GalleryStatus;
  detail?: string;
}) {
  const meta = status ? GALLERY_STATUS[status] : null;
  return (
    <ClickableCard label={title} href={href} padding={3}>
      <VStack gap={3}>
        <div className="lp-cover">
          <Images size={28} strokeWidth={1.5} aria-hidden />
        </div>
        <VStack gap={1}>
          <Text weight="semibold" maxLines={1}>
            {title}
          </Text>
          <HStack gap={2} align="center">
            {meta && (
              <>
                <StatusDot variant={meta.dot} label={meta.label} />
                <Text type="supporting">{meta.label}</Text>
              </>
            )}
            {detail && (
              <Text type="supporting" maxLines={1}>
                {meta ? `· ${detail}` : detail}
              </Text>
            )}
          </HStack>
        </VStack>
      </VStack>
    </ClickableCard>
  );
}
