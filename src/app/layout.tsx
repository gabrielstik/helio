import type { Metadata } from "next";
import { PRODUCT_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: "CRM et galeries clients pour photographes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
