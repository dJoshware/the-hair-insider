import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type ProductInput = {
    title?: unknown;
    url?: unknown;
    lesson_id?: unknown;
    sort_order?: unknown;
};

type ProductRow = {
    id: string;
    course_id: string;
    lesson_id: string | null;
    title: string;
    url: string;
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
    // lessons -> modules -> course_id
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

// GET /api/admin/courses/:id/products?lesson=<lessonId?>
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
        .from('course_products')
        .select('id, course_id, lesson_id, title, url, sort_order')
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
    return NextResponse.json({ products: (data ?? []) as ProductRow[] });
}

// POST /api/admin/courses/:id/products
// Body: { lesson_id?: string | null, products: [...] }
// If lesson_id is provided, replace ONLY that lesson's products.
// If lesson_id is null/omitted, replace all course-level products (lesson_id is null).
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

    const productsRaw: ProductInput[] = Array.isArray(body.products)
        ? body.products
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

    // Normalize + filter (only fully filled)
    const payload = productsRaw
        .map(p => ({
            course_id: courseId,
            lesson_id: scopeLessonId, // force scope on save
            title: String(p.title ?? '').trim(),
            url: String(p.url ?? '').trim(),
            sort_order: p.sort_order == null ? null : Number(p.sort_order),
        }))
        .filter(p => p.title.length > 0 && p.url.length > 0)
        .map((p, idx) => ({
            ...p,
            sort_order: p.sort_order ?? idx + 1,
        }));

    // Replace semantics (delete then insert)
    let del = admin.from('course_products').delete().eq('course_id', courseId);
    del = scopeLessonId
        ? del.eq('lesson_id', scopeLessonId)
        : del.is('lesson_id', null);

    const { error: delErr } = await del;
    if (delErr)
        return NextResponse.json({ error: delErr.message }, { status: 500 });

    if (payload.length === 0) {
        return NextResponse.json({ products: [] });
    }

    const { data, error } = await admin
        .from('course_products')
        .insert(payload)
        .select('id, course_id, lesson_id, title, url, sort_order');

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    const sorted = [...((data ?? []) as ProductRow[])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );

    return NextResponse.json({ products: sorted });
}
