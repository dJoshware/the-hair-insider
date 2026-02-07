import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';

const adminDb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const { id } = await ctx.params;

    const { data, error } = await adminDb
        .from('courses')
        .select(
            'id, title, slug, subtitle, description, cover_image_url, stripe_price_id, is_published',
        )
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course: data });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const { id } = await ctx.params;
    const body = await req.json();

    const patch = {
        title: body.title ?? undefined,
        slug: body.slug ?? undefined,
        subtitle: body.subtitle ?? undefined,
        description: body.description ?? undefined,
        cover_image_url: body.cover_image_url ?? undefined,
        stripe_price_id: body.stripe_price_id ?? undefined,
        is_published: body.is_published ?? undefined,
    };

    const { data, error } = await adminDb
        .from('courses')
        .update(patch)
        .eq('id', id)
        .select(
            'id, title, slug, subtitle, description, cover_image_url, stripe_price_id, is_published',
        )
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course: data });
}
