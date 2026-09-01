import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendThankYouEmail } from '@/lib/email/sendThankYou';
import { SLUG_TO_RESEND_PROPERTY, markResendPurchase } from '@/lib/email/resendPurchase';
import { notifyBillingMismatch } from '@/lib/email/notifyBillingMismatch';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
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

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const course_id = session.metadata?.course_id;
        let user_id = session.metadata?.user_id;

        if (!course_id) {
            return NextResponse.json(
                { error: 'Missing course_id metadata' },
                { status: 400 },
            );
        }

        const email = session.customer_details?.email ?? null;

        // Payment Link purchases won't have user_id, so look up by email
        if (!user_id && email) {
            const { data: rows } = await admin.rpc('get_user_id_by_email', {
                p_email: email,
            });
            if (rows?.[0]?.id) user_id = rows[0].id;
        }

        const stripeCustomerId =
            typeof session.customer === 'string' ? session.customer : null;
        const stripePaymentIntentId =
            typeof session.payment_intent === 'string'
                ? session.payment_intent
                : null;

        // Resolve all course IDs to grant; for bundles, include component courses
        const courseIdsToGrant = [course_id];

        const { data: purchasedCourse } = await admin
            .from('courses')
            .select('slug')
            .eq('id', course_id)
            .maybeSingle();

        if (purchasedCourse?.slug === 'hair-growth-bundle') {
            const { data: components } = await admin
                .from('courses')
                .select('id')
                .in('slug', [
                    'hair-growth-foundations-mini-course',
                    'hair-growth-workbook',
                ]);
            for (const c of components ?? []) courseIdsToGrant.push(c.id);
        }

        if (!user_id) {
            // No account exists yet (e.g. a cold Payment Link buyer who
            // hasn't signed up). Stash the purchase so it can be claimed
            // as soon as an account with this email exists.
            if (!email) {
                console.warn(
                    'Stripe webhook: no user_id or email on session',
                    session.id,
                );
                return NextResponse.json({ received: true });
            }

            const pending = courseIdsToGrant.map(cid => ({
                email,
                course_id: cid,
                stripe_customer_id: stripeCustomerId,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: stripePaymentIntentId,
            }));

            const { error: pendingError } = await admin
                .from('pending_entitlements')
                .insert(pending);

            if (pendingError) {
                console.error(
                    'Failed to store pending entitlement:',
                    pendingError,
                );
            }

            return NextResponse.json({ received: true });
        }

        const entitlements = courseIdsToGrant.map(cid => ({
            user_id,
            course_id: cid,
            status: 'active',
            stripe_customer_id: stripeCustomerId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: stripePaymentIntentId,
        }));

        const { error } = await admin
            .from('entitlements')
            .upsert(entitlements, { onConflict: 'user_id,course_id' });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Non-blocking side effects; don't fail the webhook if these error
        try {
            const { data: userData } =
                await admin.auth.admin.getUserById(user_id);
            const email = userData.user?.email;
            const firstName =
                userData.user?.user_metadata?.full_name?.split(' ')[0] ?? '';

            const slug = purchasedCourse?.slug ?? '';
            const resendProperty = SLUG_TO_RESEND_PROPERTY[slug];

            if (email) {
                await Promise.all([
                    ...(resendProperty
                        ? [markResendPurchase(email, resendProperty)]
                        : []),
                    sendThankYouEmail({
                        email,
                        firstName,
                        courseSlug: slug,
                    }),
                ]);
            }
        } catch (e) {
            console.error('Post-purchase side effect error:', e);
        }

        return NextResponse.json({ received: true });
    }

    if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;

        const paymentIntentId =
            typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : null;

        if (!paymentIntentId) {
            return NextResponse.json({ received: true });
        }

        const shouldRevoke =
            (charge.amount_refunded ?? 0) >= (charge.amount ?? 0);

        if (shouldRevoke) {
            const { error } = await admin
                .from('entitlements')
                .update({ status: 'refunded' })
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

    if (event.type === 'customer.updated') {
        const customer = event.data.object as Stripe.Customer;
        const previous = (event.data as { previous_attributes?: Partial<Stripe.Customer> })
            .previous_attributes;

        // Only act when this event actually represents a name/email change
        // in the billing portal, not some unrelated customer update.
        const nameChanged = !!previous && 'name' in previous;
        const emailChanged = !!previous && 'email' in previous;

        if (nameChanged || emailChanged) {
            try {
                const { data: stripeRow } = await admin
                    .from('stripe')
                    .select('id')
                    .eq('stripe_customer_id', customer.id)
                    .maybeSingle();

                if (stripeRow?.id) {
                    const { data: userData } = await admin.auth.admin.getUserById(
                        stripeRow.id,
                    );
                    const accountEmail = userData.user?.email;
                    const accountName =
                        userData.user?.user_metadata?.display_name ?? '';

                    if (accountEmail) {
                        await notifyBillingMismatch({
                            accountEmail,
                            accountName,
                            billingEmail: customer.email ?? null,
                            billingName: customer.name ?? null,
                        });
                    }
                }
            } catch (e) {
                console.error('Billing mismatch check failed:', e);
            }
        }

        return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
}
