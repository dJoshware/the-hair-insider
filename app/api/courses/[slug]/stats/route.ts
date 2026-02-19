import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { extractVideoId, getVimeoVideoDurationSeconds } from '@/lib/vimeo';

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ slug: string }> },
) {
    const { slug } = await ctx.params;

    // 1) course by slug
    const { data: course, error: courseErr } = await createSupabaseAdminClient()
        .from('courses')
        .select('id, slug, is_published')
        .eq('slug', slug)
        .maybeSingle();

    if (courseErr) {
        return NextResponse.json({ error: courseErr.message }, { status: 500 });
    }

    if (!course || !course.is_published) {
        return NextResponse.json(
            { error: 'Course not found' },
            { status: 404 },
        );
    }

    // 2) modules
    const { data: modules, error: modErr } = await createSupabaseAdminClient()
        .from('modules')
        .select('id')
        .eq('course_id', course.id)
        .eq('is_published', true);

    if (modErr) {
        return NextResponse.json({ error: modErr.message }, { status: 500 });
    }

    const moduleIds = (modules ?? []).map(m => m.id);
    const modulesCount = moduleIds.length;

    // 3) lessons
    let lessonsCount = 0;
    let durationSeconds = 0;

    if (moduleIds.length > 0) {
        const { data: lessons, error: lesErr } = await createSupabaseAdminClient()
            .from('lessons')
            .select('video_url')
            .in('module_id', moduleIds)
            .eq('is_published', true);

        if (lesErr) {
            return NextResponse.json(
                { error: lesErr.message },
                { status: 500 },
            );
        }

        const urls = (lessons ?? [])
            .map(l => l.video_url)
            .filter((x): x is string => Boolean(x));

        lessonsCount = urls.length;

        // 4) Vimeo durations (unique IDs)
        const ids = Array.from(
            new Set(
                urls
                    .map(u => extractVideoId(u))
                    .filter((x): x is string => !!x),
            ),
        );

        // Simple parallel fetch with safety:
        const durations = await Promise.all(
            ids.map(async id => {
                try {
                    const s = await getVimeoVideoDurationSeconds(id);
                    return typeof s === 'number' ? s : 0;
                } catch {
                    return 0;
                }
            }),
        );

        durationSeconds = durations.reduce((a, b) => a + b, 0);
    }

    return NextResponse.json({
        modulesCount,
        lessonsCount,
        durationSeconds,
    });
}
