import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { claimPendingEntitlements } from '@/lib/entitlements/claimPending';
import crypto from 'crypto';

async function subscribeToMailchimp(email: string) {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const prefix = process.env.MAILCHIMP_SERVER_PREFIX;
    if (!apiKey || !audienceId || !prefix) return;

    const normalized = email.trim().toLowerCase();
    const emailHash = crypto.createHash('md5').update(normalized).digest('hex');
    const basicAuth = Buffer.from(`anystring:${apiKey}`).toString('base64');
    const baseUrl = `https://${prefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${emailHash}`;
    const headers = { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/json' };

    const res = await fetch(baseUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ email_address: normalized, status_if_new: 'subscribed' }),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`Mailchimp subscribe failed in callback (${res.status}):`, text);
        return;
    }

    await fetch(`${baseUrl}/tags`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tags: [{ name: 'lead-magnet', status: 'active' }] }),
    });
}

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
            // Same-device confirmation; subscribe to Mailchimp now that we have the session
            subscribeToMailchimp(data.session.user.email).catch(e =>
                console.error('Mailchimp callback error:', e),
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
