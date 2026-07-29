import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { claimPendingEntitlements } from '@/lib/entitlements/claimPending';

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

export async function POST(req: Request) {
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
    if (userErr || !userData.user?.email) {
        return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    try {
        const claimed = await claimPendingEntitlements(
            userData.user.id,
            userData.user.email,
        );
        return NextResponse.json({ claimed });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
