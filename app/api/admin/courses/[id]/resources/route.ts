import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type ResourceInput = {
    title?: unknown;
    url?: unknown;
    storage_path?: unknown;
    storage_bucket?: unknown;
    sort_order?: unknown;
};

type ResourceRow = {
    id: string;
    course_id: string;
    lesson_id: string | null;
    title: string;
    url: string | null;
    storage_bucket: string | null;
    storage_path: string | null;
    sort_order: number | null;
};

async function verifyCourseExists(
    admin: ReturnType<typeof createSupabaseAdminClient>,
    courseId: string,
) {
    const { data, error } = await admin
        .from('courses')
        .select('id')
        .eq('id', courseId)
        .maybeSingle();

    if (error) return { ok: false as const, status: 500, error: error.message };
    if (!data)
        return { ok: false as const, status: 404, error: 'Course not found.' };
    return { ok: true as const };
}

async function verifyLessonBelongsToCourse(
    admin: ReturnType<typeof createSupabaseAdminClient>,
    courseId: string,
    lessonId: string,
) {
    const { data, error } = await admin
        .from('lessons')
        .select('id, modules!inner(course_id)')
        .eq('id', lessonId)
        .maybeSingle();

    if (error) return { ok: false as const, status: 500, error: error.message };
    if (!data)
        return {
            ok: false as const,
            status: 400,
            error: 'lesson_id not found.',
        };

    const modCourseId = (data as any).modules?.course_id;
    if (modCourseId !== courseId) {
        return {
            ok: false as const,
            status: 400,
            error: 'lesson_id does not belong to this course.',
        };
    }

    return { ok: true as const };
}

// GET /api/admin/courses/:id/resources?lesson=<lessonId?>
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok)
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );

    const admin = createSupabaseAdminClient();
    const { id } = await params;
    const courseId = id;

    const lessonFilter = req.nextUrl.searchParams.get('lesson');

    const courseOk = await verifyCourseExists(admin, courseId);
    if (!courseOk.ok)
        return NextResponse.json(
            { error: courseOk.error },
            { status: courseOk.status },
        );

    if (lessonFilter) {
        const lessonOk = await verifyLessonBelongsToCourse(
            admin,
            courseId,
            lessonFilter,
        );
        if (!lessonOk.ok)
            return NextResponse.json(
                { error: lessonOk.error },
                { status: lessonOk.status },
            );
    }

    let q = admin
        .from('course_resources')
        .select(
            'id, course_id, lesson_id, title, url, storage_bucket, storage_path, sort_order',
        )
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

    if (lessonFilter) {
        q = q.eq('lesson_id', lessonFilter);
    } else {
        q = q.is('lesson_id', null);
    }

    const { data, error } = await q;

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ resources: (data ?? []) as ResourceRow[] });
}

// POST /api/admin/courses/:id/resources
// Body: { lesson_id?: string | null, resources: [...] }
// Replace only scoped rows (lesson-specific or course-level).
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok)
        return NextResponse.json(
            { error: auth.error },
            { status: auth.status },
        );

    const admin = createSupabaseAdminClient();
    const { id } = await params;
    const courseId = id;

    const courseOk = await verifyCourseExists(admin, courseId);
    if (!courseOk.ok)
        return NextResponse.json(
            { error: courseOk.error },
            { status: courseOk.status },
        );

    const body = await req.json();

    const scopeLessonId =
        body.lesson_id === undefined ||
        body.lesson_id === null ||
        body.lesson_id === ''
            ? null
            : String(body.lesson_id);

    const resourcesRaw: ResourceInput[] = Array.isArray(body.resources)
        ? body.resources
        : [];

    if (scopeLessonId) {
        const lessonOk = await verifyLessonBelongsToCourse(
            admin,
            courseId,
            scopeLessonId,
        );
        if (!lessonOk.ok)
            return NextResponse.json(
                { error: lessonOk.error },
                { status: lessonOk.status },
            );
    }

    const DEFAULT_BUCKET = 'hair-insider-bucket';

    const payload = resourcesRaw
        .map(r => {
            const title = String(r.title ?? '').trim();
            const url = String(r.url ?? '').trim();
            const storage_path = String(r.storage_path ?? '').trim();
            const storage_bucket = String(r.storage_bucket ?? '').trim();

            const hasUrl = url.length > 0;
            const hasFile = storage_path.length > 0;

            return {
                course_id: courseId,
                lesson_id: scopeLessonId,
                title,
                url: hasUrl ? url : null,
                storage_bucket: hasFile
                    ? storage_bucket || DEFAULT_BUCKET
                    : null,
                storage_path: hasFile ? storage_path : null,
                sort_order: r.sort_order == null ? null : Number(r.sort_order),
                _valid: title.length > 0 && (hasUrl || hasFile),
            };
        })
        .filter(x => x._valid)
        .map(({ _valid, ...rest }, idx) => ({
            ...rest,
            sort_order: rest.sort_order ?? idx + 1,
        }));

    // Replace semantics
    let del = admin.from('course_resources').delete().eq('course_id', courseId);
    del = scopeLessonId
        ? del.eq('lesson_id', scopeLessonId)
        : del.is('lesson_id', null);

    const { error: delErr } = await del;
    if (delErr)
        return NextResponse.json({ error: delErr.message }, { status: 500 });

    if (payload.length === 0) {
        return NextResponse.json({ resources: [] });
    }

    const { data, error } = await admin
        .from('course_resources')
        .insert(payload)
        .select(
            'id, course_id, lesson_id, title, url, storage_bucket, storage_path, sort_order',
        );

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    const sorted = [...((data ?? []) as ResourceRow[])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );

    return NextResponse.json({ resources: sorted });
}
