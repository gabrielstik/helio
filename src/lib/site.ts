/** Nom du produit. */
export const PRODUCT_NAME = "Helio";

/** Origine de l'app (sans slash final). En local : http://localhost:3000. */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "contact@example.com";
