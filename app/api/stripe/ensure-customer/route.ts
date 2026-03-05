import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
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
        let user = null;

        // 1) Try Bearer token first (email/password signin path)
        const authHeader = req.headers.get('authorization') || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice('Bearer '.length)
            : null;

        if (token) {
            const { data, error } = await admin.auth.getUser(token);
            if (!error && data.user) user = data.user;
        }

        // 2) Fall back to cookies (OAuth / magic link path)
        if (!user) {
            const supabase = await createSupabaseServerClient();
            const { data } = await supabase.auth.getUser();
            user = data.user ?? null;
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 },
            );
        }

        // 3) Check for existing Stripe customer
        const { data: row, error: rowErr } = await admin
            .from('stripe')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .maybeSingle();

        if (rowErr)
            return NextResponse.json(
                { error: rowErr.message },
                { status: 500 },
            );

        if (row?.stripe_customer_id) {
            return NextResponse.json({
                stripe_customer_id: row.stripe_customer_id,
            });
        }

        // 4) Create Stripe customer
        const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            metadata: { supabase_user_id: user.id },
        });

        const { error: upsertErr } = await admin.from('stripe').upsert({
            id: user.id,
            stripe_customer_id: customer.id,
        });

        if (upsertErr)
            return NextResponse.json(
                { error: upsertErr.message },
                { status: 500 },
            );

        return NextResponse.json({
            stripe_customer_id: customer.id,
            created: true,
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
