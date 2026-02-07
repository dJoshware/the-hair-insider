import { supabase } from '@/lib/supabase/client';

export async function startCheckout(courseSlug: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    // Not signed in: redirect to signin and come back to this course
    if (!token) {
        const next = encodeURIComponent(`/courses/${courseSlug}`);
        window.location.href = `/signin?next=${next}`;
        return;
    }

    const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseSlug }),
    });

    const json = (await res.json()) as { url?: string; error?: string };

    if (!res.ok || !json.url) {
        throw new Error(json.error || 'Checkout failed.');
    }

    window.location.href = json.url;
}
