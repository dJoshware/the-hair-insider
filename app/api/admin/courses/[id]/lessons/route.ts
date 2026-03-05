import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { normalizeVimeoEmbedUrl } from '@/lib/vimeo';

type LessonInput = {
    title?: unknown;
    order?: unknown;
    video_url?: unknown;
    is_published?: unknown;
};

type LessonInsert = {
    module_id: string;
    title: string;
    order: number;
    video_url: string;
    is_published: boolean;
};

type LessonRow = LessonInsert & { id: string };

const adminDb = createSupabaseAdminClient();

async function verifyModuleBelongsToCourse(moduleId: string, courseId: string) {
    const { data: mod, error: modErr } = await adminDb
        .from('modules')
        .select('id, course_id')
        .eq('id', moduleId)
        .maybeSingle();

    if (modErr) {
        return { ok: false as const, status: 500, error: modErr.message };
    }

    if (!mod || mod.course_id !== courseId) {
        return {
            ok: false as const,
            status: 400,
            error: 'module_id does not belong to this course.',
        };
    }

    return { ok: true as const };
}

/**
 * GET /api/admin/courses/:id/lessons?module=<module_id>
 * Used by LessonsClient to prefill existing lesson rows.
 */
export async function GET(
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

    const moduleId = req.nextUrl.searchParams.get('module') || '';
    if (!moduleId) {
        return NextResponse.json(
            { error: 'Missing module id.' },
            { status: 400 },
        );
    }

    const verify = await verifyModuleBelongsToCourse(moduleId, courseId);
    if (!verify.ok) {
        return NextResponse.json(
            { error: verify.error },
            { status: verify.status },
        );
    }

    const { data, error } = await adminDb
        .from('lessons')
        .select('id, module_id, title, order, video_url, is_published')
        .eq('module_id', moduleId)
        .order('order', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lessons: data ?? [] });
}

/**
 * POST /api/admin/courses/:id/lessons
 * Body: { module_id, lessons: [...] }
 * Replace semantics: delete all lessons for module_id, then insert the provided set.
 */
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

    if (!module_id) {
        return NextResponse.json(
            { error: 'Missing module_id.' },
            { status: 400 },
        );
    }

    // verify module belongs to course
    const verify = await verifyModuleBelongsToCourse(module_id, courseId);
    if (!verify.ok) {
        return NextResponse.json(
            { error: verify.error },
            { status: verify.status },
        );
    }

    // Normalize + validate payload.
    // IMPORTANT: allow lessons.length === 0 to mean "clear the module"
    const rawLessons: LessonInput[] = Array.isArray(body.lessons)
        ? body.lessons
        : [];

    const payload: LessonInsert[] = rawLessons
        .map(l => ({
            module_id,
            title: String(l.title ?? '').trim(),
            order: Number(l.order ?? 1),
            video_url: normalizeVimeoEmbedUrl(String(l.video_url || '')),
            is_published: l.is_published === false ? false : true,
        }))
        .filter(p => p.title && p.video_url)
        .sort((a: LessonInsert, b: LessonInsert) => a.order - b.order)
        .map((p, idx) => ({ ...p, order: idx + 1 }));

    // Replace: delete everything first
    const { error: delErr } = await adminDb
        .from('lessons')
        .delete()
        .eq('module_id', module_id);

    if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    // If payload is empty after filtering, we're done (module cleared)
    if (payload.length === 0) {
        return NextResponse.json({ lessons: [] });
    }

    const { data, error } = await adminDb
        .from('lessons')
        .insert(payload)
        .select('id, module_id, title, order, video_url, is_published');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure consistent ordering in response
    const sorted = [...((data ?? []) as LessonRow[])].sort(
        (a: LessonRow, b: LessonRow) => a.order - b.order,
    );
    return NextResponse.json({ lessons: sorted });
}
