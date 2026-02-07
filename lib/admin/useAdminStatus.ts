'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase/client';

type AdminStatus =
    | { loading: true; signedIn: boolean; isAdmin: boolean }
    | { loading: false; signedIn: boolean; isAdmin: boolean };

export function useAdminStatus(): AdminStatus {
    const [state, setState] = React.useState<AdminStatus>({
        loading: true,
        signedIn: false,
        isAdmin: false,
    });

    React.useEffect(() => {
        let cancelled = false;

        async function refresh() {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;

            if (!token) {
                if (!cancelled) {
                    setState({
                        loading: false,
                        signedIn: false,
                        isAdmin: false,
                    });
                }
                return;
            }

            const res = await fetch('/api/admin/me', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = (await res.json()) as { isAdmin?: boolean };

            if (!cancelled) {
                setState({
                    loading: false,
                    signedIn: true,
                    isAdmin: Boolean(json.isAdmin) && res.ok,
                });
            }
        }

        // initial
        refresh();

        // update on auth changes (signin/signout)
        const { data: sub } = supabase.auth.onAuthStateChange(() => {
            refresh();
        });

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, []);

    return state;
}
