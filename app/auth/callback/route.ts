import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { claimPendingEntitlements } from '@/lib/entitlements/claimPending';
import { enrollInResendWelcome } from '@/lib/email/resendWelcome';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
        // A failed exchange is expected on cross-device confirmation (PKCE
        // verifier lives on the initiating browser, not the confirming device).
        // Supabase already confirmed the email before this redirect.
        if (error) {
            console.error('Code exchange failed:', error.message);
        } else if (data.session?.user?.email) {
            // Same-device confirmation; subscribe to Resend now that we have the session
            const firstName =
                data.session.user.user_metadata?.full_name?.split(' ')[0] ?? '';
            enrollInResendWelcome(data.session.user.email, firstName).catch(e =>
                console.error('Resend welcome enroll error:', e),
            );
            claimPendingEntitlements(
                data.session.user.id,
                data.session.user.email,
            ).catch(e =>
                console.error('Claim pending entitlements error:', e),
            );
        }
    }

    return NextResponse.redirect(new URL('/auth/confirmed', url.origin));
}
