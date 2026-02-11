"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = React.useState("Signing you in...");

    React.useEffect(() => {
        let cancelled = false;

        const run = async () => {
            // retry a few times in case session isn't available immediately
            for (let i = 0; i < 10; i++) {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    if (cancelled) return;

                    setStatus("Finalizing your account...");

                    const token = data.session.access_token;

                    // Ensure Stripe customer exists (non-blocking)
                    try {
                        const res = await fetch("/api/stripe/ensure-customer", {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({}),
                        });
                        // If it fails, ignore so login still succeeds
                        // (but ensure-customer route should be idempotent)
                        void res;
                    } catch {}

                    const next = localStorage.getItem("postAuthRedirect");
                    if (next) localStorage.removeItem("postAuthRedirect");

                    router.replace(next || "/");
                    return;
                }

                // wait 150ms then try again
                await new Promise(r => setTimeout(r, 150));
            }

            if (!cancelled) {
                setStatus(
                    "Couldn’t complete sign-in. Please try logging in again.",
                );
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <div className='mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6'>
            <p className='text-sm text-muted-foreground'>{status}</p>
        </div>
    );
}
