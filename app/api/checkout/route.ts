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
        console.log('[/checkout] userData:', userData.user.id);

        const { courseSlug } = (await req.json()) as { courseSlug?: string };
        if (!courseSlug) {
            return NextResponse.json(
                { error: 'Missing courseSlug.' },
                { status: 400 },
            );
        }

        const { data: course, error: courseErr } = await admin
            .from('courses')
            .select('id, slug, title, stripe_price_id, is_published')
            .eq('slug', courseSlug)
            .eq('is_published', true)
            .maybeSingle();

        if (courseErr || !course) {
            return NextResponse.json(
                { error: 'Course not found.' },
                { status: 404 },
            );
        }
        if (!course.stripe_price_id) {
            return NextResponse.json(
                { error: 'Course is not purchasable yet.' },
                { status: 400 },
            );
        }

        const { data: stripeDB, error: stripeDBErr } = await admin
            .from('stripe')
            .select('stripe_customer_id')
            .eq('id', userData.user.id)
            .maybeSingle();

        if (stripeDBErr) {
            return NextResponse.json(
                { error: stripeDBErr.message },
                { status: 500 },
            );
        }

        const stripeCustomerId = stripeDB?.stripe_customer_id ?? null;
        console.log('[/checkout] Stripe Customer ID', stripeDB);

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [{ price: course.stripe_price_id, quantity: 1 }],
            success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/courses/${course.slug}`,
            customer: stripeCustomerId,
            metadata: {
                course_id: course.id,
                user_id: userData.user.id,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
