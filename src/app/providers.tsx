"use client";

import Link from "next/link";
import { InternationalizationProvider, type MessageEntry } from "@astryxdesign/core/i18n";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { photosTheme } from "@/theme/photos";

/** Thème Astryx, liens Next et textes du design system en français (`messages`, chargés côté serveur). */
export function Providers({ messages, children }: { messages: Record<string, MessageEntry>; children: React.ReactNode }) {
  return (
    <InternationalizationProvider locale="fr-FR" messages={{ "fr-FR": messages }}>
      <Theme theme={photosTheme}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </InternationalizationProvider>
  );
}
