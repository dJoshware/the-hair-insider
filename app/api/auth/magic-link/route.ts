import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email } = (await req.json().catch(() => ({}))) as {
        email?: string;
    };

    if (!email || typeof email !== 'string') {
        return NextResponse.json(
            { error: 'Email is required.' },
            { status: 400 },
        );
    }

    // Placeholder: later you will send an email magic link via:
    // - NextAuth Email provider
    // - Supabase OTP
    // - Resend + custom token
    return NextResponse.json({ ok: true });
}
