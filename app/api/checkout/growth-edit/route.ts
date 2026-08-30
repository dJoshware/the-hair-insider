import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

const FOUNDER_PROMO_CODE = 'FOUNDER20';

// Guest-friendly checkout for the Growth Edit (no sign-in required, matching
// the old Payment Link's UX). Unlike a Payment Link's ?prefilled_promo_code
// query param -- which only attaches the discount once Stripe's hosted page
// finishes its own client-side prefill, a moment after load -- creating the
// Checkout Session here bakes the discount in server-side at creation time,
// so a fast one-tap checkout (Apple Pay in particular) can never complete
// before the founder price is actually applied.
export async function POST() {
    try {
        const { data: course, error: courseErr } = await admin
            .from('courses')
            .select('id, stripe_price_id')
            .eq('slug', 'hair-growth-edit')
            .eq('is_published', true)
            .maybeSingle();

        if (courseErr || !course?.stripe_price_id) {
            return NextResponse.json(
                { error: 'Growth Edit is not purchasable right now.' },
                { status: 400 },
            );
        }

        let founderPromoId: string | null = null;
        try {
            const promos = await stripe.promotionCodes.list({
                code: FOUNDER_PROMO_CODE,
                active: true,
                limit: 1,
            });
            const promo = promos.data[0];
            if (
                promo &&
                (promo.max_redemptions == null ||
                    promo.times_redeemed < promo.max_redemptions)
            ) {
                founderPromoId = promo.id;
            }
        } catch (e) {
            console.error('Founder promo lookup failed:', e);
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [{ price: course.stripe_price_id, quantity: 1 }],
            ...(founderPromoId
                ? { discounts: [{ promotion_code: founderPromoId }] }
                : { allow_promotion_codes: true }),
            customer_creation: 'always',
            success_url: `${siteUrl}/account?tab=library`,
            cancel_url: `${siteUrl}/hair-growth-edit`,
            metadata: { course_id: course.id },
        });

        if (!session.url) {
            return NextResponse.json(
                { error: 'Could not start checkout.' },
                { status: 500 },
            );
        }

        return NextResponse.json({ url: session.url });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
