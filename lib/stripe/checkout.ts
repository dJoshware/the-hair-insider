import { supabase } from '@/lib/supabase/client';

const SLUG_TO_PAYMENT_LINK: Record<string, string> = {
    'hair-growth-bundle': 'https://buy.stripe.com/7sY6oIbT56x4b5Y0PV4c800',
    'hair-growth-edit': 'https://buy.stripe.com/00wbJ2aP1g7E5LEcyD4c802',
};

async function getValidToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
    // No session at all
    return null;
}

export async function startCheckout(courseSlug: string) {
    const paymentLink = SLUG_TO_PAYMENT_LINK[courseSlug];
    if (paymentLink) {
        window.location.href = paymentLink;
        return;
    }

    const signinUrl = `/signin?next=${encodeURIComponent(`/courses#${courseSlug}`)}`;

    let token = await getValidToken();
    if (!token) {
        window.location.href = signinUrl;
        return;
    }

    let res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseSlug }),
    });

    // Stale token; try refreshing once before giving up
    if (res.status === 401) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        token = refreshed.session?.access_token ?? null;
        if (!token) {
            window.location.href = signinUrl;
            return;
        }
        res = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseSlug }),
        });
    }

    if (res.status === 401) {
        window.location.href = signinUrl;
        return;
    }

    const json = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !json.url) {
        throw new Error(json.error || 'Checkout failed.');
    }

    window.location.href = json.url;
}
