import { NextResponse } from "next/server";
import { isStripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** GET /api/payment-config – ob Online-Zahlung (Stripe) aktiv ist. */
export async function GET() {
  return NextResponse.json({ stripe: isStripeEnabled() });
}
