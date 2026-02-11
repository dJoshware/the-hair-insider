import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

export async function POST(req: Request) {
    const sig = req.headers.get('stripe-signature');
    if (!sig)
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 },
        );

    const body = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (err) {
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 },
        );
    }

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

        console.log("Session:", session.id, session.metadata);
        console.log("Stripe event:", event.type);
        console.log("Stripe customer_id:", session.customer);

        // Upsert entitlement
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

        if (error)
            return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
