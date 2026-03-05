"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function CallbackClient() {
    const router = useRouter();
    const [status, setStatus] = React.useState("Signing you in...");

    React.useEffect(() => {
        let cancelled = false;

        const run = async () => {
            // retry a few times in case session isn't available immediately
            for (let i = 0; i < 30; i++) {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    if (cancelled) return;

                    setStatus("Finalizing your account...");

                    // Ensure Stripe customer exists (non-blocking)
                    try {
                        const res = await fetch("/api/stripe/ensure-customer", {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${data.session.access_token}`,
                                "Content-Type": "application/json",
                            },
                            body: "{}",
                        });

                        if (!res.ok) {
                            console.error(
                                "ensure-customer failed",
                                await res.text(),
                            );
                        }
                    } catch (e) {
                        console.error("ensure-customer threw:", e);
                    }

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
