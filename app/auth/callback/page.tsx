"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = React.useState("Signing you in...");

    React.useEffect(() => {
        // Supabase will parse tokens from the URL hash automatically.
        // We just wait for the session to appear, then redirect.
        const run = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                const next = localStorage.getItem("postAuthRedirect");
                if (next) {
                    localStorage.removeItem("postAuthRedirect");
                    router.replace(next);
                } else {
                    router.replace("/");
                }
                return;
            }

            // If no session, user may have clicked an expired link or redirect URL misconfigured.
            setStatus(
                "Couldn’t complete sign-in. Please try logging in again.",
            );
        };

        run();
    }, [router]);

    return (
        <div className='mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6'>
            <p className='text-sm text-muted-foreground'>{status}</p>
        </div>
    );
}
