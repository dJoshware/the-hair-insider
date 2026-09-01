import { createClient } from '@supabase/supabase-js';
import { sendThankYouEmail } from '@/lib/email/sendThankYou';
import { SLUG_TO_RESEND_PROPERTY, markResendPurchase } from '@/lib/email/resendPurchase';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

// Grants any purchases that arrived (via a Stripe webhook) before this
// user had an account, matched by email. Safe to call on every sign-in.
export async function claimPendingEntitlements(
    userId: string,
    email: string,
): Promise<number> {
    const { data: pending, error: pendingErr } = await admin
        .from('pending_entitlements')
        .select('*')
        .ilike('email', email);

    if (pendingErr) throw new Error(pendingErr.message);
    if (!pending || pending.length === 0) return 0;

    const entitlements = pending.map(p => ({
        user_id: userId,
        course_id: p.course_id,
        status: 'active',
        stripe_customer_id: p.stripe_customer_id,
        stripe_checkout_session_id: p.stripe_checkout_session_id,
        stripe_payment_intent_id: p.stripe_payment_intent_id,
    }));

    const { error: upsertErr } = await admin
        .from('entitlements')
        .upsert(entitlements, { onConflict: 'user_id,course_id' });

    if (upsertErr) throw new Error(upsertErr.message);

    // The webhook that first saw this purchase couldn't send a thank-you
    // email or mark the Resend purchase property (no account existed yet
    // to send it to). Do that now, once per distinct checkout, using the
    // bundle's own row as "primary" when a bundle purchase expanded into
    // multiple component rows.
    try {
        const { data: courses } = await admin
            .from('courses')
            .select('id, slug')
            .in('id', pending.map(p => p.course_id));
        const slugById = new Map((courses ?? []).map(c => [c.id, c.slug]));

        const groups = new Map<string, typeof pending>();
        for (const p of pending) {
            const key = p.stripe_checkout_session_id ?? p.stripe_payment_intent_id ?? p.id;
            const group = groups.get(key) ?? [];
            group.push(p);
            groups.set(key, group);
        }

        const { data: userData } = await admin.auth.admin.getUserById(userId);
        const firstName =
            userData.user?.user_metadata?.full_name?.split(' ')[0] ?? '';

        await Promise.all(
            Array.from(groups.values()).map(async group => {
                const primary =
                    group.find(p => slugById.get(p.course_id) === 'hair-growth-bundle') ??
                    group[0];
                const slug = slugById.get(primary.course_id) ?? '';
                const resendProperty = SLUG_TO_RESEND_PROPERTY[slug];

                await Promise.all([
                    ...(resendProperty ? [markResendPurchase(email, resendProperty)] : []),
                    sendThankYouEmail({ email, firstName, courseSlug: slug }),
                ]);
            }),
        );
    } catch (e) {
        console.error('Claimed-purchase side effect error:', e);
    }

    await admin
        .from('pending_entitlements')
        .delete()
        .in(
            'id',
            pending.map(p => p.id),
        );

    return pending.length;
}
