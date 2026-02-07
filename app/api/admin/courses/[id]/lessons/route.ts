import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
// import Stripe from 'stripe';

const adminDb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

function normalizeVimeoEmbed(url: string) {
    const trimmed = (url || '').trim();
    if (!trimmed) return trimmed;

    if (trimmed.includes('player.vimeo.com')) return trimmed;

    const match = trimmed.match(/vimeo\.com\/(\d+)/);
    if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;

    return trimmed;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    const { id } = await params;
    const courseId = id;
    const body = await req.json();

    const module_id = String(body.module_id || '');
    const lessons = Array.isArray(body.lessons) ? body.lessons : [];

    if (!module_id) {
        return NextResponse.json(
            { error: 'Missing module_id.' },
            { status: 400 },
        );
    }

    if (lessons.length === 0) {
        return NextResponse.json(
            { error: 'No lessons provided.' },
            { status: 400 },
        );
    }

    // verify module belongs to course
    const { data: mod, error: modErr } = await adminDb
        .from('modules')
        .select('id, course_id')
        .eq('id', module_id)
        .maybeSingle();

    if (modErr)
        return NextResponse.json({ error: modErr.message }, { status: 500 });
    if (!mod || mod.course_id !== courseId) {
        return NextResponse.json(
            { error: 'module_id does not belong to this course.' },
            { status: 400 },
        );
    }

    const payload = lessons.map((l: any) => ({
        module_id,
        title: String(l.title || '').trim(),
        order: Number(l.order || 1),
        video_url: normalizeVimeoEmbed(String(l.video_url || '')),
        is_published: l.is_published === false ? false : true,
    }));

    const bad = payload.find((p: { title: string; video_url: string }) => !p.title || !p.video_url);
    if (bad) {
        return NextResponse.json(
            { error: 'Each lesson needs a title and a Vimeo URL.' },
            { status: 400 },
        );
    }

    // If you want to overwrite existing lessons for this module on each save:
    // delete then insert (simple MVP)
    const { error: delErr } = await adminDb
        .from('lessons')
        .delete()
        .eq('module_id', module_id);
    if (delErr)
        return NextResponse.json({ error: delErr.message }, { status: 500 });

    const { data, error } = await adminDb
        .from('lessons')
        .insert(payload)
        .select('id, module_id, title, order, video_url, is_published');

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ lessons: data });
}
