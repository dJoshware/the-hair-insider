import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { enrollInWelcomeSequence } from '@/lib/email/welcomeSequence';

export async function POST(req: Request) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { email, firstName, reset } = await req.json();
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const admin = createSupabaseAdminClient();

    if (reset) {
        await admin.from('welcome_sequence').delete().ilike('email', normalized);
    }

    try {
        const outcome = await enrollInWelcomeSequence(normalized, firstName ?? '');
        return NextResponse.json({ ok: true, outcome });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
