import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // important for Stripe signature verification

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!, // server-only
);

export async function POST(req: Request) {
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 },
        );
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch {
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 },
        );
    }

    // 1) Purchase completed => grant access
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const course_id = session.metadata?.course_id;
        const user_id = session.metadata?.user_id;

        if (!course_id || !user_id) {
            return NextResponse.json(
                { error: 'Missing metadata' },
                { status: 400 },
            );
        }

        const { error } = await admin.from('entitlements').upsert(
            {
                user_id,
                course_id,
                status: 'active',
                stripe_customer_id:
                    typeof session.customer === 'string'
                        ? session.customer
                        : null,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id:
                    typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : null,
            },
            { onConflict: 'user_id,course_id' },
        );

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ received: true });
    }

    // 2) Refund issued => revoke access (for one-time course purchases)
    if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;

        // We rely on payment_intent to map back to entitlements
        const paymentIntentId =
            typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : null;

        if (!paymentIntentId) {
            // Not all charges have payment_intent (rare for Checkout), so just acknowledge.
            return NextResponse.json({ received: true });
        }

        // Decide policy: full refund only, or any refund.
        // Most course sites revoke on FULL refunds only:
        const shouldRevoke =
            (charge.amount_refunded ?? 0) >= (charge.amount ?? 0);

        if (shouldRevoke) {
            const { error } = await admin
                .from('entitlements')
                .update({ status: 'refunded' }) // or "revoked"
                .eq('stripe_payment_intent_id', paymentIntentId);

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 },
                );
            }
        }

        return NextResponse.json({ received: true });
    }

    // (Optional) handle disputes too
    // event.type === "charge.dispute.created" => update status to "revoked"

    return NextResponse.json({ received: true });
}
