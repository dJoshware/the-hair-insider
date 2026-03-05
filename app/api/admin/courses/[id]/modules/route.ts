import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';

const adminDb = createSupabaseAdminClient();

type Ctx = { params: Promise<{ id: string }> };

export async function GET(
    req: NextRequest,
    ctx: Ctx,
) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const { id } = await ctx.params;

    const { data, error } = await adminDb
        .from('modules')
        .select('id, title, order, is_published')
        .eq('course_id', id)
        .order('order', { ascending: true });

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ modules: data ?? [] });
}
