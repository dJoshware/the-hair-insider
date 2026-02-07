'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function useAdminGuard() {
    const router = useRouter();
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        const run = async () => {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;

            if (!token) {
                router.replace(
                    `/signin?next=${encodeURIComponent('/admin/courses/new')}`,
                );
                return;
            }

            const res = await fetch('/api/admin/me', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (!res.ok || !json.isAdmin) {
                router.replace('/');
                return;
            }

            setReady(true);
        };

        run();
    }, [router]);

    return { ready };
}
