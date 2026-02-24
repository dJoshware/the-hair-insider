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

export default function MeetYourEducatorClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: storyRef, inView: storyIn } = useInView({
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
                        <div className='grid gap-10 md:grid-cols-2 md:items-center'>
                            <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                                <Badge
                                    variant='secondary'
                                    className='w-fit'>
                                    Meet Your Educator
                                </Badge>

                                <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                    Hi, I’m Lauren.
                                </h1>

                                <p className='text-lg leading-8'>
                                    I’m a licensed cosmetologist with over 8
                                    years of experience specializing in color,
                                    extensions, and corrective routines. I’ve
                                    worked with hundreds of clients who felt
                                    stuck in trial and error.
                                </p>

                                <p className='text-lg leading-8'>
                                    What I saw over and over wasn’t a product
                                    problem. It was a clarity problem.
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

                                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                                    <Button
                                        asChild
                                        className='h-12 px-6'>
                                        <Link href='/courses'>
                                            Browse Courses
                                        </Link>
                                    </Button>
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
                                        className='shrink-0'
                                        asChild>
                                        <Link href='/about'>About Me</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* Story + Credibility */}
                <section
                    ref={storyRef}
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14 sm:py-20'>
                        <FadeIn
                            inView={storyIn}
                            delayMs={150}>
                            <div className='grid gap-10 md:grid-cols-2'>
                                <div className='space-y-6 bg-background/35 rounded-3xl p-6'>
                                    <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                                        Why This Exists
                                    </h2>

                                    <p className='text-lg leading-8'>
                                        Behind the chair, I watched people spend
                                        a lot of money chasing results, only to
                                        feel more confused and defeated. They
                                        were doing “all the things” but didn’t
                                        know what mattered most for their hair.
                                    </p>

                                    <p className='text-lg leading-8'>
                                        The Hair Insider is built to give you
                                        clarity and a routine framework you can
                                        actually stick to, rooted in practical
                                        hair science and real-world outcomes.
                                    </p>

                                    <Separator />

                                    <div className='rounded-2xl bg-muted p-4'>
                                        <p className='text-xs font-medium'>
                                            My Approach
                                        </p>
                                        <p className='mt-1 text-sm text-foreground'>
                                            We focus on understanding, not
                                            overload. Simple routines,
                                            intentional steps, and realistic
                                            expectations.
                                        </p>
                                    </div>
                                </div>

                                <div className='grid gap-4 sm:grid-cols-2'>
                                    {[
                                        {
                                            title: "Real Client Experience",
                                            desc: "Built from patterns seen across hundreds of routines.",
                                        },
                                        {
                                            title: "Practical Education",
                                            desc: "Explain it clearly so you can apply it without confusion.",
                                        },
                                        {
                                            title: "Routine-First Mindset",
                                            desc: "Consistency over intensity. Adjustments over overhauls.",
                                        },
                                        {
                                            title: "Long-Term Results",
                                            desc: "Support growth and retention with repeatable habits.",
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
                                    className='h-12 px-6'>
                                    <Link href='/what-is-it'>What Is It?</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant='secondary'
                                    className='h-12 px-6'>
                                    <Link href='/inside-the-course'>
                                        Inside The Course
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
