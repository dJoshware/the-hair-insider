import { NextResponse } from 'next/server';
import { enrollInResendWelcome } from '@/lib/email/resendWelcome';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const { email, firstName } = await req.json();
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    try {
        await enrollInResendWelcome(email, firstName);
    } catch (e) {
        console.error('Resend subscribe failed:', e);
    }

    return NextResponse.json({ ok: true });
}
