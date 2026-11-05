/**
 * Les trois rôles du cahier des charges.
 *   photographer  paie l'abonnement : CRM, galeries, personnalisation (/studio)
 *   client        « administrateur » : le client du photographe, avec un compte (/espace)
 *   guest         invité, sans compte : une galerie par lien, QR code ou mot de passe (/g/<slug>)
 * Seuls les deux premiers existent en base (profiles.role) ; l'invité n'a pas de session.
 */
export type AccountRole = "photographer" | "client";
export type Role = AccountRole | "guest";

/** Où envoyer un compte après connexion. */
export function homeFor(role: AccountRole): string {
  return role === "photographer" ? "/studio/crm" : "/espace";
}
