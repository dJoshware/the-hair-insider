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

export default function InsideTheCourseClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: gridRef, inView: gridIn } = useInView({
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
                                Course Library
                            </Badge>

                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                Inside The Course
                            </h1>

                            <p className='max-w-3xl text-lg leading-8'>
                                Your access begins the moment you enroll.
                                Inside, you’ll find short, focused lessons and
                                downloadable tools designed to make hair health
                                feel simple, practical, and repeatable.
                            </p>

                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                <Button
                                    asChild
                                    className='h-12 px-6'>
                                    <Link href='/courses'>Browse Courses</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant='secondary'
                                    className='h-12 px-6'>
                                    <Link href='/what-is-it'>What Is It?</Link>
                                </Button>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* Content */}
                <section
                    ref={gridRef}
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                        <FadeIn
                            inView={gridIn}
                            delayMs={150}>
                            <div className='grid gap-10 md:grid-cols-2'>
                                <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        What You Get
                                    </h2>

                                    <p className='text-lg leading-8'>
                                        This isn’t a random collection of tips.
                                        It’s a structured library that helps you
                                        understand cause and effect, so you can
                                        make confident decisions and build a
                                        routine that fits your life.
                                    </p>

                                    <ul className='space-y-4 text-sm'>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Short, focused lessons
                                            </p>
                                            <p>
                                                Clear explanations that don’t
                                                overcomplicate the science.
                                            </p>
                                        </li>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Downloadable guides
                                            </p>
                                            <p>
                                                Checklists and PDFs to help you
                                                implement without guessing.
                                            </p>
                                        </li>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Lifetime access
                                            </p>
                                            <p>
                                                Purchase once, return anytime,
                                                and build consistency over time.
                                            </p>
                                        </li>
                                    </ul>

                                    <Separator />

                                    <div className='rounded-2xl bg-muted p-4'>
                                        <p className='text-xs font-medium'>
                                            Our Promise
                                        </p>
                                        <p className='mt-1 text-sm text-foreground'>
                                            If you can wash your hair, you can
                                            follow this. Practical routines,
                                            realistic expectations, and real
                                            education.
                                        </p>
                                    </div>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    {[
                                        {
                                            title: "Private Library Access",
                                            desc: "Unlock content instantly, organized by topic and goal.",
                                        },
                                        {
                                            title: "Foundational Lessons",
                                            desc: "Build understanding step by step, so changes actually stick.",
                                        },
                                        {
                                            title: "Implementation Tools",
                                            desc: "Downloadable guides designed to make execution easy.",
                                        },
                                        {
                                            title: "Simple Routine Framework",
                                            desc: "A repeatable approach you can adjust as your hair changes.",
                                        },
                                    ].map(s => (
                                        <Card
                                            key={s.title}
                                            className='rounded-2xl'>
                                            <CardHeader>
                                                <CardTitle className='text-sm'>
                                                    {s.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='text-sm'>
                                                {s.desc}
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
                                    <Link href='/meet-your-educator'>
                                        Meet Your Educator
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
