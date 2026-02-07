import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function POST(req: Request) {
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
            await supabase.auth.getUser(token);
        if (userErr || !userData.user) {
            return NextResponse.json(
                { error: 'Invalid session.' },
                { status: 401 },
            );
        }

        const { courseSlug } = (await req.json()) as { courseSlug?: string };
        if (!courseSlug) {
            return NextResponse.json(
                { error: 'Missing courseSlug.' },
                { status: 400 },
            );
        }

        const { data: course, error: courseErr } = await supabase
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

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [{ price: course.stripe_price_id, quantity: 1 }],
            success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/courses/${course.slug}`,
            customer_email: userData.user.email ?? undefined,
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
