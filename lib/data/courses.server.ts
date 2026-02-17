import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CourseRow = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    stripe_price_id: string | null;
};

export async function getPublishedCourseBySlug(slug: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from('courses')
        .select(
            'id, slug, title, subtitle, description, cover_image_url, stripe_price_id',
        )
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data as CourseRow | null;
}
