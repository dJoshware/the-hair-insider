import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    if (!secretKey)
        throw new Error(
            'Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)',
        );

    return createClient(url, secretKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
