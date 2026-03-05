import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';

const adminDb = createSupabaseAdminClient();

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function GET(req: Request) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const { data, error } = await adminDb
        .from('courses')
        .select(
            'id, title, slug, subtitle, is_published, cover_image_url, created_at',
        )
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ courses: data ?? [] });
}

export async function POST(req: Request) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const body = await req.json();

    const title = String(body.title || '').trim();
    if (!title)
        return NextResponse.json(
            { error: 'Title is required.' },
            { status: 400 },
        );

    const slug = String(body.slug || slugify(title)).trim();
    const subtitle = body.subtitle ? String(body.subtitle) : null;
    const description = body.description ? String(body.description) : null;
    const cover_image_url = body.cover_image_url
        ? String(body.cover_image_url)
        : null;
    const stripe_price_id = body.stripe_price_id
        ? String(body.stripe_price_id)
        : null;
    const is_published = !!body.is_published;

    // 1) create course
    const { data: course, error: courseErr } = await adminDb
        .from('courses')
        .insert({
            title,
            slug,
            subtitle,
            description,
            cover_image_url,
            stripe_price_id,
            is_published,
        })
        .select('id, slug, title')
        .single();

    if (courseErr)
        return NextResponse.json({ error: courseErr.message }, { status: 500 });

    // 2) create default module (“Lessons”) so lessons can attach to it
    const { data: moduleRow, error: modErr } = await adminDb
        .from('modules')
        .insert({
            course_id: course.id,
            title: 'Lessons',
            order: 1,
            is_published: true,
        })
        .select('id')
        .single();

    if (modErr)
        return NextResponse.json({ error: modErr.message }, { status: 500 });

    return NextResponse.json({ course, defaultModuleId: moduleRow.id });
}
