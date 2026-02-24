"use client";

import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

export default function WhatIsItClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const { ref: detailRef, inView: detailIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main>
                {/* Hero */}
                <section
                    ref={heroRef}
                    className='mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-20 sm:pt-20'>
                    <FadeIn
                        inView={heroIn}
                        delayMs={100}>
                        <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                            <Badge
                                variant='secondary'
                                className='w-fit'>
                                Education-First Hair Care
                            </Badge>

                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                What Is The Hair Insider?
                            </h1>

                            <p className='max-w-3xl text-lg leading-8'>
                                The Hair Insider is a structured education
                                library that teaches you the why behind hair
                                health, so you stop guessing and start building
                                routines that actually work for your hair.
                            </p>

                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                <Button
                                    asChild
                                    className='h-12 px-6'>
                                    <Link href='/courses'>Browse Courses</Link>
                                </Button>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* Details */}
                <section
                    ref={detailRef}
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                        <FadeIn
                            inView={detailIn}
                            delayMs={150}>
                            <div className='grid gap-10 md:grid-cols-2 md:items-start'>
                                <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        The Problem We Solve
                                    </h2>

                                    <p className='text-lg leading-8'>
                                        Most people aren’t failing because they
                                        “don’t have the right products.” They’re
                                        stuck because they don’t have clarity.
                                        Clarity on hair type, porosity,
                                        patterns, damage, and how to
                                        troubleshoot what they’re seeing week to
                                        week.
                                    </p>

                                    <p className='text-lg leading-8'>
                                        This course library helps you connect
                                        what you feel and see (dryness,
                                        breakage, frizz, shedding, buildup, slow
                                        retention) to what’s actually happening,
                                        then guides you into simple adjustments
                                        that compound over time.
                                    </p>

                                    <Separator />

                                    <div className='rounded-2xl bg-muted p-4'>
                                        <p className='text-xs font-medium'>
                                            How it feels
                                        </p>
                                        <p className='mt-1 text-sm text-foreground'>
                                            Less trial and error. Less
                                            overwhelm. More “ohhh that makes
                                            sense.” Then a routine you can
                                            actually maintain.
                                        </p>
                                    </div>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    {[
                                        {
                                            title: "Education-First",
                                            desc: "Understand the purpose behind each step so you can make decisions for your own hair.",
                                        },
                                        {
                                            title: "No Product Overload",
                                            desc: "Intentional routines using fewer moving parts, so consistency becomes easy.",
                                        },
                                        {
                                            title: "Troubleshooting Mindset",
                                            desc: "Learn what common issues mean and what to change first (without panic buying).",
                                        },
                                        {
                                            title: "Built for Real Life",
                                            desc: "Short lessons + practical implementation tools you can use immediately.",
                                        },
                                    ].map(item => (
                                        <Card
                                            key={item.title}
                                            className='rounded-2xl'>
                                            <CardHeader>
                                                <CardTitle className='text-sm'>
                                                    {item.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='text-sm'>
                                                {item.desc}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className='mt-10 flex flex-col gap-3 sm:flex-row sm:items-center'>
                                <Button
                                    asChild
                                    className='h-12 px-6'
                                    variant='secondary'>
                                    <Link href='/inside-the-course'>
                                        See What&#39;s Inside
                                    </Link>
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
