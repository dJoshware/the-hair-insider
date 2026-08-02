import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY!);
const admin = createSupabaseAdminClient();

function isValidToken(email: string, token: string): boolean {
    const expected = crypto
        .createHmac('sha256', process.env.EMAIL_UNSUB_SECRET!)
        .update(email.toLowerCase())
        .digest('hex');
    return (
        expected.length === token.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
    );
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email || !token || !isValidToken(email, token)) {
        return NextResponse.json({ error: 'Invalid unsubscribe link.' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    await resend.contacts.update({ email: normalized, unsubscribed: true }).catch(e => {
        console.error('Resend unsubscribe failed:', e);
    });

    await admin
        .from('welcome_sequence')
        .update({ status: 'unsubscribed', next_send_at: null })
        .ilike('email', normalized);

    return NextResponse.redirect(new URL('/unsubscribed', url.origin));
}
