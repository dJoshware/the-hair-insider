import { createClient } from '@supabase/supabase-js';

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
        is_founder: p.is_founder,
    }));

    const { error: upsertErr } = await admin
        .from('entitlements')
        .upsert(entitlements, { onConflict: 'user_id,course_id' });

    if (upsertErr) throw new Error(upsertErr.message);

    const anyFounder = pending.some(p => p.is_founder);
    if (anyFounder) {
        const { data: userData } = await admin.auth.admin.getUserById(userId);
        if (!userData.user?.user_metadata?.is_founder) {
            await admin.auth.admin.updateUserById(userId, {
                user_metadata: {
                    ...userData.user?.user_metadata,
                    is_founder: true,
                },
            });
        }
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
