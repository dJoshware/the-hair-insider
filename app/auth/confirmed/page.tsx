"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function EmailConfirmedPage() {
    React.useEffect(() => {
        // If a session exists (same-device confirmation), run side effects.
        // Cross-device: no session here; side effects run on sign-in instead.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) return;
            fetch("/api/stripe/ensure-customer", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }).catch(() => {});
            fetch("/api/resend/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email }),
            }).catch(() => {});
        });
    }, []);

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main className='mx-auto flex max-w-6xl flex-col items-center px-6 py-14 sm:py-20'>
                <div className='w-[350px] max-w-md'>
                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-2xl'>
                                You&apos;re confirmed.
                            </CardTitle>
                            <CardDescription>
                                Your email has been verified. You can close this
                                tab and go back to finish signing in on your
                                original device.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <p className='text-sm'>
                                On the same device? Sign in below.
                            </p>
                            <Button
                                asChild
                                className='w-full'>
                                <Link href='/signin'>Sign in</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
