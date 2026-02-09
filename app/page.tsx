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

export default function Home() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.12,
    });
    const { ref: whatRef, inView: whatIn } = useInView({
        triggerOnce: true,
        threshold: 0.12,
    });
    const { ref: howRef, inView: howIn } = useInView({
        triggerOnce: true,
        threshold: 0.12,
    });
    const { ref: stylistRef, inView: stylistIn } = useInView({
        triggerOnce: true,
        threshold: 0.12,
    });
    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            {/* Fixed background layer */}
            <div
                className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'var(--home-bg)'
                }}
            />

            {/* Overlay layer (for readability) */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-background/0 backdrop-blur-[5px]" />

            {/* Main content */}
            <Navbar />

            <main>
                {/* Hero */}
                <section
                    ref={heroRef}
                    className='mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-20 sm:pt-20'>
                    <FadeIn
                        inView={heroIn}
                        delayMs={0}>
                        <div className='grid gap-10 md:grid-cols-2 md:items-center'>
                            <div className='space-y-6'>
                                <Badge
                                    variant='secondary'
                                    className='w-fit'>
                                    Education-first hair care
                                </Badge>

                                <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                    Healthy hair, explained simply.
                                </h1>

                                <p className='max-w-xl text-lg leading-8'>
                                    The Hair Insider is a guided course
                                    that teaches you what your hair actually
                                    needs, how to stop guessing, and how to
                                    build a routine you can stick to.
                                </p>

                                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                    <Button
                                        asChild
                                        className='h-12 px-6'>
                                        <Link href='/courses/hair-insider-mini-course'>
                                            Start here
                                        </Link>
                                    </Button>
                                </div>

                                <div className='flex justify-center gap-x-6 gap-y-2 text-sm'>
                                    <span>Downloadable guides</span>
                                    <span>Simple routines</span>
                                </div>
                            </div>

                            <Card className='rounded-3xl'>
                                <CardHeader className='flex-row items-center justify-between'>
                                    <CardTitle className='text-base'>
                                        Included in the course
                                    </CardTitle>
                                    <Badge variant='outline'>MVP</Badge>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <ul className='space-y-3 text-sm'>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Hair type clarity
                                            </p>
                                            <p>
                                                Stop trial and error and
                                                understand what applies to you.
                                            </p>
                                        </li>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Routine builder
                                            </p>
                                            <p>
                                                A routine you can do weekly
                                                without overthinking.
                                            </p>
                                        </li>
                                        <li>
                                            <p className='font-medium text-foreground'>
                                                Downloadable guides
                                            </p>
                                            <p>
                                                PDFs and checklists inside your
                                                library.
                                            </p>
                                        </li>
                                    </ul>

                                    <Separator />

                                    <div className='rounded-2xl bg-muted p-4'>
                                        <p className='text-xs font-medium'>
                                            Quick promise
                                        </p>
                                        <p className='mt-1 text-sm text-foreground'>
                                            If you can wash your hair, you can
                                            do this. We keep it simple,
                                            practical, and consistent.
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
                            delayMs={100}>
                            <div className='grid gap-10 md:grid-cols-2'>
                                <div className='space-y-4'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        What we are
                                    </h2>
                                    <p className='text-lg leading-8'>
                                        A course-driven education library
                                        designed to help you build a hair
                                        routine that protects length, supports
                                        the scalp, and makes your hair feel
                                        consistently good.
                                    </p>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    {[
                                        {
                                            title: "Education-first",
                                            desc: "Understand why you’re doing each step.",
                                        },
                                        {
                                            title: "No product overload",
                                            desc: "Fewer products, better results, less confusion.",
                                        },
                                        {
                                            title: "Designed for busy people",
                                            desc: "Short lessons and clear routines.",
                                        },
                                        {
                                            title: "Gated library access",
                                            desc: "Buy once, unlock your content instantly.",
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

                {/* How it works */}
                <section
                    ref={howRef}
                    id='how'
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                        <FadeIn
                            inView={howIn}
                            delayMs={100}>
                            <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                How it works
                            </h2>

                            <div className='mt-10 grid gap-4 md:grid-cols-3'>
                                {[
                                    {
                                        step: "01",
                                        title: "Purchase access",
                                        desc: "Choose the course offer and check out securely.",
                                    },
                                    {
                                        step: "02",
                                        title: "Sign in instantly",
                                        desc: "Passwordless sign-in keeps it simple and secure.",
                                    },
                                    {
                                        step: "03",
                                        title: "Use the library",
                                        desc: "Watch lessons, download PDFs, build your routine.",
                                    },
                                ].map(s => (
                                    <Card
                                        key={s.step}
                                        className='rounded-3xl'>
                                        <CardHeader>
                                            <p className='text-xs font-semibold'>
                                                STEP {s.step}
                                            </p>
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
                    ref={stylistRef}
                    id='stylist'
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                        <FadeIn inView={stylistIn} delayMs={100}>
                            <div className='grid gap-10 md:grid-cols-2 md:items-center'>
                                <div className='space-y-4'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        Meet your stylist
                                    </h2>
                                    <p className='text-lg leading-8'>
                                        Hi, I’m Lauren. I’ve spent years behind
                                        the chair helping clients get real
                                        results with routines that make sense.
                                        This course is everything I wish people
                                        knew before they spent money on the
                                        wrong products.
                                    </p>

                                    <div className='flex flex-wrap gap-2'>
                                        <Badge variant='secondary'>
                                            Color + extensions background
                                        </Badge>
                                        <Badge variant='secondary'>
                                            Routine-based education
                                        </Badge>
                                        <Badge variant='secondary'>
                                            Healthy length focus
                                        </Badge>
                                    </div>
                                </div>

                                <Card className='rounded-3xl'>
                                    <CardHeader>
                                        <CardTitle className='text-base'>
                                            Quick note
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4 text-sm'>
                                        <p>
                                            The MVP version focuses on a clean
                                            library experience: sign in, unlock,
                                            watch lessons, download guides.
                                            We’ll expand from there.
                                        </p>

                                        <div className='flex flex-col gap-3 sm:flex-row'>
                                            <Button
                                                variant='outline'
                                                asChild
                                                className='h-12 flex-1'>
                                                <Link href='/signin'>
                                                    I already bought it
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                className='h-12 flex-1'>
                                                <Link href='/courses'>
                                                    Get access
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
