import { createClient } from '@supabase/supabase-js';

function parseAdminEmails(): Set<string> {
    const raw = process.env.ADMIN_EMAILS || '';
    return new Set(
        raw
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean),
    );
}

export async function requireAdminFromRequest(req: Request) {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ')
        ? auth.slice('Bearer '.length)
        : null;

    if (!token) {
        return { ok: false as const, status: 401, error: 'Not authenticated.' };
    }

    // Use publishable client to validate JWT and get user info
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
        return { ok: false as const, status: 401, error: 'Invalid session.' };
    }

    const email = (data.user.email || '').toLowerCase();
    const admins = parseAdminEmails();

    if (!admins.has(email)) {
        return { ok: false as const, status: 403, error: 'Forbidden.' };
    }

    return { ok: true as const, user: data.user, email, token };
}
