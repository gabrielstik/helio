import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import type { MessageEntry } from "@astryxdesign/core/i18n";
import frCatalog from "@astryxdesign/core/locales/fr-FR.json";
import { PRODUCT_NAME } from "@/lib/site";
import { Providers } from "./providers";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Les textes du design system (« Fermer », « Obligatoire »…) sans les notes des traducteurs. */
const astryxMessages: Record<string, MessageEntry> = Object.fromEntries(
  Object.entries(frCatalog as Record<string, { defaultMessage: string }>).map(([key, entry]) => [key, { defaultMessage: entry.defaultMessage }]),
);

export const metadata: Metadata = {
  title: { default: PRODUCT_NAME, template: `%s · ${PRODUCT_NAME}` },
  description: "CRM et galeries clients pour photographes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={figtree.variable} data-astryx-theme="photos">
      <body>
        <Providers messages={astryxMessages}>{children}</Providers>
      </body>
    </html>
  );
}
