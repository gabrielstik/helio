/** Libellés affichés pour les énumérations de la base (supabase/migrations). */

export type GalleryStatus = "draft" | "published" | "archived";
export type DocumentKind = "quote" | "contract" | "invoice";
export type DocumentStatus = "draft" | "sent" | "signed" | "paid" | "void";

export const GALLERY_STATUS: Record<GalleryStatus, { label: string; dot: "neutral" | "success" | "warning" }> = {
  draft: { label: "Brouillon", dot: "neutral" },
  published: { label: "Publiée", dot: "success" },
  archived: { label: "Archivée", dot: "warning" },
};

export const DOCUMENT_KIND: Record<DocumentKind, string> = {
  quote: "Devis",
  contract: "Contrat",
  invoice: "Facture",
};

export const DOCUMENT_STATUS: Record<DocumentStatus, { label: string; color: "default" | "blue" | "green" | "gray" }> = {
  draft: { label: "Brouillon", color: "default" },
  sent: { label: "Envoyé", color: "blue" },
  signed: { label: "Signé", color: "green" },
  paid: { label: "Payé", color: "green" },
  void: { label: "Annulé", color: "gray" },
};

const DAY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** « 12 juin 2026 » pour une colonne `date` (AAAA-MM-JJ), sans décalage de fuseau. */
export function formatDay(isoDate: string): string {
  return DAY.format(new Date(`${isoDate}T00:00:00Z`));
}

/** « 1 client », « 3 clients ». */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count > 1 ? many : one}`;
}
