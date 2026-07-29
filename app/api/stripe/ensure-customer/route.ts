import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY!;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    return new Stripe(key);
}

export async function POST(req: Request) {
    const stripe = getStripe();
    try {
        const admin = createSupabaseAdminClient();

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

        // A guest Payment Link purchase (before this account existed) may
        // have already created a Stripe customer for this email. Reuse it
        // instead of minting a duplicate.
        let customerId: string | null = null;

        const { data: entitlementRow } = await admin
            .from('entitlements')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .not('stripe_customer_id', 'is', null)
            .limit(1)
            .maybeSingle();

        if (entitlementRow?.stripe_customer_id) {
            customerId = entitlementRow.stripe_customer_id;
        } else if (user.email) {
            const existing = await stripe.customers.list({
                email: user.email,
                limit: 1,
            });
            if (existing.data[0]) customerId = existing.data[0].id;
        }

        let created = false;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email ?? undefined,
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;
            created = true;
        }

        // Store it
        const { error: upsertErr } = await admin.from('stripe').upsert({
            id: user.id,
            stripe_customer_id: customerId,
        });

        if (upsertErr) {
            return NextResponse.json(
                { error: upsertErr.message },
                { status: 500 },
            );
        }

        // Backfill any entitlements missing a customer id (e.g. a manually
        // granted or pending-claimed purchase that predates this lookup)
        await admin
            .from('entitlements')
            .update({ stripe_customer_id: customerId })
            .eq('user_id', user.id)
            .is('stripe_customer_id', null);

        return NextResponse.json({
            stripe_customer_id: customerId,
            created,
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
