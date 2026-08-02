import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { processWelcomeSequenceRow } from '@/lib/email/welcomeSequence';

export async function POST(req: Request) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await req.json();
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: row, error } = await admin
        .from('welcome_sequence')
        .select('id, email, first_name, day, status')
        .eq('id', id)
        .maybeSingle();

    if (error || !row) {
        return NextResponse.json({ error: error?.message ?? 'Row not found' }, { status: 404 });
    }

    try {
        // Bypasses next_send_at — this is a test-only immediate step, the
        // same logic the cron job runs on its own schedule.
        const outcome = await processWelcomeSequenceRow(row);
        return NextResponse.json({ ok: true, outcome });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 500 },
        );
    }
}
