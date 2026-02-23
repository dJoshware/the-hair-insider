"use client";

import Link from "next/link";
import Image from "next/image";
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
import { OrgJsonLd } from "@/components/seo/OrgJsonLd";

export default function HomeClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: whatRef, inView: whatIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: insideRef, inView: insideIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: educatorRef, inView: educatorIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    return (
        <>
            {/* SEO brand entity for Google */}
            <OrgJsonLd />

            <div className='relative min-h-[100dvh] text-foreground'>
                {/* Fixed background and overlay layer */}
                <Overlay />

                {/* Main content */}
                <Navbar />

                {/* Breadcrumbs */}
                <SiteBreadcrumbs />

                <main>
                    {/* Hero */}
                    <section
                        ref={heroRef}
                        className='mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-20 sm:pt-20'>
                        <FadeIn
                            inView={heroIn}
                            delayMs={100}>
                            <div className='grid gap-10 md:grid-cols-2 md:items-center'>
                                <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                                    <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                        Healthy Hair, Explained Simply.
                                    </h1>

                                    <p className='max-w-xl text-lg leading-8'>
                                        The Hair Insider is a guided course
                                        focused on the why behind hair health so
                                        you can stop guessing, understand
                                        what&#39;s holding your hair back, and
                                        work <em>with</em> your hair, not
                                        against it.
                                    </p>

                                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                        <Button
                                            asChild
                                            className='h-12 px-6'>
                                            <Link href='/courses/hair-growth-foundations-mini-course'>
                                                Start Here
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className='flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm'>
                                        <Badge variant='secondary'>
                                            In-Depth Lessons
                                        </Badge>
                                        <Badge variant='secondary'>
                                            Downloadable Guides
                                        </Badge>
                                        <Badge variant='secondary'>
                                            Simple Routines
                                        </Badge>
                                    </div>
                                </div>

                                <Card className='rounded-3xl'>
                                    <CardHeader className='flex-row items-center justify-between'>
                                        <CardTitle className='text-base'>
                                            Included In The Course
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <ul className='space-y-3 text-sm'>
                                            <li>
                                                <p className='font-medium text-foreground'>
                                                    Hair Type Clarity
                                                </p>
                                                <p>
                                                    Stop guessing. Learn exactly
                                                    how your hair behaves and
                                                    what actually applies to
                                                    you.
                                                </p>
                                            </li>
                                            <li>
                                                <p className='font-medium text-foreground'>
                                                    Routine Builder
                                                </p>
                                                <p>
                                                    Build a simple, repeatable
                                                    weekly routine that supports
                                                    growth and retention —
                                                    without overcomplicating it.
                                                </p>
                                            </li>
                                            <li>
                                                <p className='font-medium text-foreground'>
                                                    Downloadable Guides
                                                </p>
                                                <p>
                                                    Structured PDFs and
                                                    checklists inside your
                                                    library so you can implement
                                                    with confidence.
                                                </p>
                                            </li>
                                        </ul>

                                        <Separator />

                                        <div className='rounded-2xl bg-muted p-4'>
                                            <p className='text-xs font-medium'>
                                                Our Promise
                                            </p>
                                            <p className='mt-1 text-sm text-foreground'>
                                                If you can wash your hair, you
                                                can follow this. We keep it
                                                practical, consistent, and
                                                rooted in real hair science.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </FadeIn>
                    </section>

                    {/* What it is */}
                    <section
                        ref={whatRef}
                        id='what'
                        className='border-t'>
                        <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                            <FadeIn
                                inView={whatIn}
                                delayMs={200}>
                                <div className='grid gap-10 md:grid-cols-2'>
                                    <div className='space-y-4 bg-background/35 rounded-3xl p-6'>
                                        <Badge
                                            variant='secondary'
                                            className='w-fit'>
                                            Education-First Hair Care
                                        </Badge>
                                        <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                            What Is It?
                                        </h2>
                                        <p className='text-lg leading-8'>
                                            A structured education library that
                                            teaches you how to build a hair
                                            routine that actually works — so you
                                            stop guessing, stop wasting money,
                                            and finally understand how to grow
                                            and retain healthy length.
                                        </p>
                                    </div>

                                    <div className='grid gap-4 sm:grid-cols-2'>
                                        {[
                                            {
                                                title: "Education-First",
                                                desc: "Learn the why behind every step — so you're not just following advice, you're understanding it",
                                            },
                                            {
                                                title: "No Product Overload",
                                                desc: "Fewer intentional products. Better results. Less confusion.",
                                            },
                                            {
                                                title: "Designed for Busy People",
                                                desc: "Short, focused lessons and clear routines you can actually maintain.",
                                            },
                                            {
                                                title: "Gated Library Access",
                                                desc: "Purchase once. Unlock instant, lifetime access to your course library.",
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
                            </FadeIn>
                        </div>
                    </section>

                    {/* Inside The Course */}
                    <section
                        ref={insideRef}
                        id='inside'
                        className='border-t'>
                        <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                            <FadeIn
                                inView={insideIn}
                                delayMs={200}>
                                <div className='space-y-4 bg-background/35 rounded-3xl p-6 w-fit'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        Inside The Course
                                    </h2>
                                    <p className='text-lg leading-8'>
                                        Your access begins the moment you
                                        enroll. Inside, you&#39;ll find a
                                        structured education library designed to
                                        help you understand your hair and build
                                        a routine that supports real growth and
                                        length retention.
                                    </p>
                                    <p className='text-lg leading-8'>
                                        Short, focused lessons walk you through
                                        the foundations. Downloadable guides
                                        help you implement with clarity.
                                        Everything is designed to be simple,
                                        practical, and repeatable.
                                    </p>
                                    <p className='text-lg leading-8'>
                                        Purchase once. Return anytime. Build
                                        with confidence.
                                    </p>
                                </div>

                                <div className='mt-10 grid gap-4 md:grid-cols-3'>
                                    {[
                                        {
                                            title: "Private Library Access",
                                            desc: "Unlock your content instantly.",
                                        },
                                        {
                                            title: "Foundational Lessons",
                                            desc: "Clear, structured education that builds understanding step by step.",
                                        },
                                        {
                                            title: "Implementation Tools",
                                            desc: "Downloadable guides designed to help you apply what you learn.",
                                        },
                                    ].map(s => (
                                        <Card
                                            key={s.title}
                                            className='rounded-3xl'>
                                            <CardHeader>
                                                <CardTitle className='text-lg'>
                                                    {s.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='text-sm'>
                                                {s.desc}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className='mt-10'>
                                    <Button
                                        asChild
                                        className='h-12 px-6'>
                                        <Link href='/courses'>See courses</Link>
                                    </Button>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* Meet your stylist */}
                    <section
                        ref={educatorRef}
                        id='educator'
                        className='border-t'>
                        <div className='mx-auto max-w-6xl px-6 pt-14 sm:py-20'>
                            <FadeIn
                                inView={educatorIn}
                                delayMs={200}>
                                <div className='grid gap-10 md:grid-cols-2 md:items-center'>
                                    <div className='space-y-4 bg-background/35 rounded-3xl p-6'>
                                        <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                            Meet Your Educator
                                        </h2>
                                        <p className='text-lg leading-8'>
                                            Hi, I&#39;m Lauren — a licensed
                                            cosmetologist with over 8 years of
                                            experience specializing in color,
                                            extensions, and corrective routines.
                                            I&#39;ve worked with hundreds of
                                            clients who&#39;ve felt stuck in
                                            trial and error.
                                        </p>
                                        <p className='text-lg leading-8'>
                                            What I saw over and over wasn&#39;t
                                            a product problem — it was a clarity
                                            problem.
                                        </p>
                                        <p className='text-lg leading-8'>
                                            This course is built from real-world
                                            experience behind the chair, focused
                                            on helping you understand your hair
                                            so you can stop guessing and start
                                            seeing consistent results.
                                        </p>

                                        <div className='flex flex-wrap gap-2'>
                                            <Badge variant='secondary'>
                                                Color + Extensions Background
                                            </Badge>
                                            <Badge variant='secondary'>
                                                Routine-Based Education
                                            </Badge>
                                            <Badge variant='secondary'>
                                                Health + Length Focus
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className='rounded-3xl border bg-card shadow-sm'>
                                        <div className='relative aspect-[4/5] overflow-hidden rounded-[22px]'>
                                            <Image
                                                src='/Lauren_headshot.jpg'
                                                alt='Lauren Jackson, founder of The Hair Insider'
                                                fill
                                                className='object-cover'
                                                sizes='(min-width: 768px) 520px, 100vw'
                                                priority={false}
                                            />
                                        </div>

                                        <div className='flex items-center justify-between gap-3 p-5'>
                                            <div className='min-w-0'>
                                                <p className='text-sm'>
                                                    Lauren Jackson
                                                </p>
                                                <p className='text-xs font-medium'>
                                                    Your Stylist + Educator
                                                </p>
                                            </div>

                                            <Button
                                                size='sm'
                                                variant='default'
                                                className='shrink-0'>
                                                <Link href='/about'>About Me</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    <Footer />
                </main>
            </div>
        </>
    );
}
