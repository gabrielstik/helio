import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * Webhook Stripe : abonnements des photographes, paiements des clients (acomptes, factures)
 * et commandes d'albums. Seule la vérification de signature est en place.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    default:
      console.info("[stripe] événement non traité :", event.type);
  }
  return NextResponse.json({ received: true });
}
