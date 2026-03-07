"use client";

import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

export default function MeetYourEducatorClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main>
                {/* Hero + Story — sticky image on desktop, stacked on mobile */}
                <section
                    ref={heroRef}
                    className='mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-20 sm:pt-20'>
                    <FadeIn
                        inView={heroIn}
                        delayMs={100}>
                        {/* Intro badges + heading — above the split on all sizes */}
                        <div className='mb-10 space-y-4'>
                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                Hi, I'm Lauren.
                            </h1>
                            <p className='text-lg leading-8 max-w-2xl'>
                                Licensed cosmetologist, 8 years behind the
                                chair, and the founder of The Hair Insider — a
                                space built to give you what your stylist wishes
                                you already knew.
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

                        {/* Split layout */}
                        <div className='flex flex-col gap-10 md:flex-row md:items-start'>
                            {/* Sticky image — right on desktop, top on mobile */}
                            <div className='w-full md:w-1/2 md:sticky md:top-24 md:self-start order-first md:order-last'>
                                <div className='rounded-3xl border bg-card shadow-sm overflow-hidden'>
                                    <div className='relative aspect-[4/5] w-full'>
                                        <Image
                                            src='/Lauren_headshot.jpg'
                                            alt='Lauren Jackson, founder of The Hair Insider'
                                            fill
                                            className='object-cover'
                                            sizes='(min-width: 768px) 40vw, 100vw'
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable story — left on desktop, below image on mobile */}
                            <div className='w-full md:w-1/2 order-last md:order-first'>
                                <div className='space-y-8 bg-background rounded-3xl p-6'>
                                    <div className='space-y-2'>
                                        <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                                            My Story
                                        </h2>
                                        <Separator />
                                    </div>

                                    <p className='text-lg leading-8 italic font-medium'>
                                        "Honestly, my hair journey started long
                                        before I ever picked up a pair of
                                        shears."
                                    </p>

                                    <p className='text-lg leading-8'>
                                        Growing up, I was obsessed with long
                                        hair. While my older sister effortlessly
                                        grew hers out, mine was short, wiry, and
                                        stubborn. My mom would buy me clip-in
                                        ponytail extensions made for kids — and
                                        I wore them every single day. That
                                        little girl desperately wanted long
                                        hair, and she never really stopped
                                        wanting it.
                                    </p>

                                    <p className='text-lg leading-8'>
                                        As I got older, my hair settled into a
                                        dense, fine, wavy-curly texture. And
                                        like most girls in high school, I wanted
                                        to be blonde. So I lightened it —
                                        repeatedly — and by senior year I
                                        already had three years of cosmetology
                                        education under my belt. You'd think I
                                        would have known better, but the
                                        experimenting didn't stop there. Once I
                                        graduated, I went straight to
                                        cosmetology school and kept going —
                                        color, bleach, toners, clip-in
                                        extensions, you name it. By the time I
                                        finished, my hair was fried, damaged,
                                        and crying for help. I turned to
                                        extensions twice — tape-ins first, then
                                        hand-tied — and both times, with little
                                        guidance on proper care, they pulled my
                                        hair out and left me worse off than
                                        before.
                                    </p>

                                    <div className='rounded-2xl bg-muted px-6 py-5'>
                                        <p className='text-lg leading-8 font-medium'>
                                            Here's the part that still gets me:
                                            I was a licensed stylist, and I
                                            still didn't know how to grow my own
                                            hair.
                                        </p>
                                    </div>

                                    <p className='text-lg leading-8'>
                                        So I figured it out. I started oiling
                                        daily, protecting my hair at night,
                                        embracing heatless and protective
                                        styles, and truly learning what my
                                        specific hair needed. A year later it
                                        was the longest and fullest it had ever
                                        been. Five years in, it reaches my waist
                                        — and people ask me constantly if it's
                                        real. It is. And no, I'll probably never
                                        cut it short.
                                    </p>

                                    <p className='text-lg leading-8'>
                                        That personal journey — combined with
                                        eight years behind the chair watching
                                        clients struggle with the same confusion
                                        — is what led me to create The Hair
                                        Insider. I kept seeing women come in
                                        frustrated, having followed influencer
                                        advice that just didn't work for their
                                        hair. And I noticed that while there's
                                        endless content for stylists and endless
                                        product pushing for consumers, nobody
                                        was sitting in the middle actually
                                        teaching clients about their own hair.
                                    </p>

                                    <p className='text-lg leading-8'>
                                        That's exactly what I'm here to do.
                                        Because when you truly understand your
                                        hair, everything changes — and that
                                        knowledge should be available to
                                        everyone, not just those lucky enough to
                                        have the right stylist.
                                    </p>

                                    <p className='text-lg leading-8 font-medium'>
                                        I'm so glad you're here. Let's get you
                                        to your best hair yet.
                                    </p>

                                    <p className='text-lg italic'>
                                        Lauren xoxo
                                    </p>

                                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center pt-2'>
                                        <Button
                                            asChild
                                            className='h-12 px-6'>
                                            <Link href='/courses'>
                                                Start Here
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                <Footer />
            </main>
        </div>
    );
}
