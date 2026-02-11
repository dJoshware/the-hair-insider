import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    return new Stripe(key);
}

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

export async function POST(req: Request) {
    const stripe = getStripe();
    console.log('[ensure-customer] hit', new Date().toISOString());
    console.log(
        '[ensure-customer] has STRIPE_SECRET_KEY?',
        !!process.env.STRIPE_SECRET_KEY,
    );
    console.log(
        '[ensure-customer] has SUPABASE_SECRET_KEY?',
        !!process.env.SUPABASE_SECRET_KEY,
    );

    try {
        const authHeader = req.headers.get('authorization') || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice('Bearer '.length)
            : null;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated.' },
                { status: 401 },
            );
        }

        const { data: userData, error: userErr } =
            await admin.auth.getUser(token);
        if (userErr || !userData.user) {
            return NextResponse.json(
                { error: 'Invalid session.' },
                { status: 401 },
            );
        }

        const user = userData.user;

        // Check if we already have a stripe customer id
        const { data: _stripe, error: _stripeErr } = await admin
            .from('stripe')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .maybeSingle();

        if (_stripeErr) {
            return NextResponse.json(
                { error: _stripeErr.message },
                { status: 500 },
            );
        }

        if (_stripe?.stripe_customer_id) {
            return NextResponse.json({
                stripe_customer_id: _stripe.stripe_customer_id,
            });
        }

        // Create stripe customer
        const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            metadata: { supabase_user_id: user.id },
        });

        // Store it
        const { error: upsertErr } = await admin.from('stripe').upsert({
            id: user.id,
            stripe_customer_id: customer.id,
        });

        if (upsertErr) {
            return NextResponse.json(
                { error: upsertErr.message },
                { status: 500 },
            );
        }

        return NextResponse.json({ stripe_customer_id: customer.id });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
