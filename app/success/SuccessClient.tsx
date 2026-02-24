"use client";

import * as React from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/site/Overlay";

export default function SuccessClient() {
    React.useEffect(() => {
        const key = "thi_confetti_success";
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");

        // one nice "pop" burst
        confetti({
            particleCount: 120,
            spread: 70,
            startVelocity: 45,
            origin: { y: 0.6 },
        });

        // optional: a couple follow-up bursts for extra dopamine
        const t1 = setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 90,
                startVelocity: 35,
                origin: { x: 0.2, y: 0.55 },
            });
            confetti({
                particleCount: 80,
                spread: 90,
                startVelocity: 35,
                origin: { x: 0.8, y: 0.55 },
            });
        }, 250);

        return () => clearTimeout(t1);
    }, []);

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />

            <div className='mx-auto max-w-2xl px-6 py-20'>
                <h1 className='text-3xl font-semibold tracking-tight'>
                    You’re in.
                </h1>
                <p className='mt-3'>
                    Your access is being activated. If it takes a moment,
                    refresh your library.
                </p>
                <p className='mt-3 text-sm'>
                    If you experience a problem with your content, please{" "}
                    <a
                        href='/contact'
                        className='underline font-bold'>
                        contact us
                    </a>
                    .
                </p>

                <div className='mt-8 flex gap-3'>
                    <Button asChild>
                        <Link href='/account?tab=library'>Go to your library</Link>
                    </Button>
                    <Button
                        asChild
                        variant='secondary'>
                        <Link href='/courses'>Back to courses</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
