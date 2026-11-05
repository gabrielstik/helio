import Stripe from "stripe";

let cached: Stripe | null = null;

/** Client Stripe côté serveur ; null tant que STRIPE_SECRET_KEY est vide. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached ??= new Stripe(key);
  return cached;
}
