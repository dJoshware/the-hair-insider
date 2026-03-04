import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (code) {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('OAuth exchange failed:', error.message);
            return NextResponse.redirect(
                new URL('/signin?error=oauth', url.origin),
            );
        }
    }

    // after session cookie is set, continue to finalize page
    return NextResponse.redirect(
        new URL('/auth/callback/finalize', url.origin),
    );
}
