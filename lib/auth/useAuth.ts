'use client';

import * as React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export function useAuth() {
    const [session, setSession] = React.useState<Session | null>(null);
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;

        // Initial session
        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return;
            setSession(data.session ?? null);
            setUser(data.session?.user ?? null);
            setLoading(false);
        });

        // React to changes (signin/signout/refresh)
        const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setLoading(false);
            },
        );

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    return { session, user, loading, signedIn: !!user };
}
