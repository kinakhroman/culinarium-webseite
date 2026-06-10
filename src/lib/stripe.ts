import Stripe from "stripe";

/**
 * Stripe-Client – nur aktiv, wenn STRIPE_SECRET_KEY gesetzt ist.
 * Ohne Key bleibt die Bezahlung „vor Ort" (Fallback), damit nichts bricht.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) {
    cached = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return cached;
}

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
