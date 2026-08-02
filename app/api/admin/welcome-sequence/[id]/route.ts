import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('welcome_sequence').delete().eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
