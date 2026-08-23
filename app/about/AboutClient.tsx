"use client";

import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Separator } from "@/components/ui/separator";

export default function AboutClient() {
    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main
                ref={pageRef}
                className='mx-auto max-w-3xl px-6 pt-14 pb-20'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='space-y-12'>
                        {/* Mission */}
                        <div className='space-y-6 bg-background/50 rounded-3xl p-6'>
                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                About The Hair Insider
                            </h1>
                            <p className='text-lg leading-8'>
                                There is a gap between what your stylist knows
                                and what they have time to tell you. Most
                                clients leave a salon appointment with
                                instructions but no understanding, and that gap
                                is where years of trial and error live.
                            </p>
                            <p className='text-lg leading-8'>
                                The Hair Insider exists to close it. Not with
                                more tips, more products, or more
                                influencer-tested routines, but with the actual
                                mechanics behind how hair works, why it does
                                what it does, and what to do about it.
                            </p>
                            <p className='text-lg leading-8'>
                                We are education-first, product-neutral, and
                                built around one belief: when you truly
                                understand your hair, everything changes.
                            </p>
                        </div>

                        <Separator />

                        {/* What this is */}
                        <div className='space-y-6 bg-background rounded-3xl p-6'>
                            <h2 className='text-2xl font-semibold tracking-tight'>
                                What we do
                            </h2>
                            <ul className='space-y-4 text-lg leading-8'>
                                <li>
                                    Teach you why your hair behaves the way it
                                    does, not just what to do about it.
                                </li>
                                <li>
                                    Help you build a simple, repeatable routine
                                    that supports real growth and length
                                    retention.
                                </li>
                                <li>
                                    Replace trial and error with an informed
                                    framework you can adjust as your hair
                                    changes.
                                </li>
                                <li>
                                    Give you the knowledge your stylist wished
                                    you already had.
                                </li>
                            </ul>
                        </div>

                        <Separator />

                        {/* What this is not */}
                        <div className='space-y-6 bg-background rounded-3xl p-6'>
                            <h2 className='text-2xl font-semibold tracking-tight'>
                                What we&apos;re not
                            </h2>
                            <p className='text-lg leading-8'>
                                The Hair Insider is an education platform, not a
                                medical resource. Nothing here constitutes
                                medical advice, diagnosis, or treatment, and
                                nothing replaces the judgment of a licensed
                                professional who has seen your hair and scalp in
                                person.
                            </p>
                            <p className='text-lg leading-8'>
                                If you&apos;re experiencing scalp pain,
                                bleeding, infection, sudden or extreme shedding,
                                allergic reactions, or any condition you&apos;re
                                unsure about, please consult a licensed
                                dermatologist or healthcare provider. We mean
                                that sincerely.
                            </p>
                            <p className='text-lg leading-8'>
                                Hair and scalp care can involve chemical
                                products, heat tools, and techniques that carry
                                real risk if used incorrectly. Always follow
                                product instructions, do patch tests where
                                recommended, and stop if something doesn&apos;t
                                feel right.
                            </p>
                        </div>

                        <Separator />

                        <p className='bg-background/50 rounded-3xl p-6 text-lg font-semibold leading-8'>
                            Questions?{" "}
                            <Link
                                href='/support'
                                className='font-medium underline underline-offset-4'>
                                Reach out.
                            </Link>{" "}
                            We&apos;re here.
                        </p>
                    </div>
                </FadeIn>
            </main>

            <Footer />
        </div>
    );
}
