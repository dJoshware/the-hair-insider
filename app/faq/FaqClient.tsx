"use client";

import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_SECTIONS = [
    {
        label: "Getting Started",
        items: [
            {
                q: "Who is The Hair Insider for?",
                a: "Anyone who's tired of guessing. If you've bought products that didn't work, followed routines that didn't stick, or left a salon without really understanding what was done to your hair, this is for you. The courses are designed for women of all hair types who want clarity over complexity.",
            },
            {
                q: "Do I need to know my hair type before starting?",
                a: "No. In fact, that's kind of the point. Most people have been given a number or a letter and told to shop accordingly. The Hair Insider teaches you to understand your hair's actual behavior: porosity, density, damage history, scalp conditions, which tells you far more than a typing system ever could.",
            },
            {
                q: "Is this for all hair types?",
                a: "Yes. Whether your hair is straight, wavy, curly, or coily, fine, thick, color-treated, or chemically processed, the foundations of hair health apply universally. The courses teach you how to apply the principles to your specific hair, not follow a one-size-fits-all protocol.",
            },
            {
                q: "I already know a lot about hair care. Will I still get something out of this?",
                a: "Probably more than you expect. Most of what circulates in hair content online is either incomplete or built around selling products. The Hair Insider fills in the mechanics that even well-researched people tend to be missing, things like why moisture retention and moisture absorption are entirely different problems, or how to evaluate whether what you're doing is actually working.",
            },
        ],
    },
    {
        label: "The Course Content",
        items: [
            {
                q: "What does a typical lesson look like?",
                a: "Short, focused, and direct. Lessons are designed to give you one clear concept at a time, not a 45-minute lecture. The goal is that you finish a lesson and immediately understand something about your hair that you didn't before, with a guide or checklist to help you apply it.",
            },
            {
                q: "How long do courses take to complete?",
                a: "That's entirely up to you. The library is yours to move through at your own pace. You can watch one lesson a day or block off an afternoon. Most people find that the shorter format means they actually finish, rather than losing momentum halfway through a 6-hour course.",
            },
            {
                q: "Will I need to buy new products to follow the routines?",
                a: "No. The courses teach you to evaluate what you already have and understand whether it's working for your hair. In most cases, people end up buying fewer products, not more. We don't sell products, and we don't earn commissions on recommendations.",
            },
            {
                q: "What are the downloadable guides?",
                a: "PDFs and checklists you keep forever, organized by topic so you can reference them anytime. Things like hair assessment frameworks, routine-building templates, and ingredient reading guides. They're designed to be practical, not decorative.",
            },
            {
                q: "Is Lauren the one teaching all the courses?",
                a: "Yes. Everything in The Hair Insider comes directly from Lauren: her education, her years behind the chair, and her own personal hair journey. There's no guest content, no outside contributors, and no brand-sponsored material.",
            },
        ],
    },
    {
        label: "Purchasing & Access",
        items: [
            {
                q: "How does access work after I purchase?",
                a: "Your library unlocks immediately after checkout. You'll create an account (or sign into an existing one) and your course will be waiting in your library. There's no waiting period, no approval process. It's instant.",
            },
            {
                q: "Is this a subscription?",
                a: "No. You purchase once and you own your access: no monthly fees, no recurring charges, no cancellation to worry about. Your library is yours for life.",
            },
            {
                q: "Is there a refund policy?",
                a: "Yes. If you're not satisfied within 7 days of purchase, reach out through the support page and we'll make it right. We want you to feel confident in the decision.",
            },
            {
                q: "Can I buy a course as a gift?",
                a: "Not directly through the current checkout flow, but if you'd like to gift access to someone, reach out via the support page and we can help arrange it.",
            },
        ],
    },
    {
        label: "Results & Expectations",
        items: [
            {
                q: "How quickly will I see results?",
                a: "Hair is slow; that's just biology. But understanding tends to happen fast. Most people have at least one 'ohh, that's why' moment within the first few lessons. The results in your actual hair take longer, but they compound, and because you understand what's happening, you stop losing ground every time you try something new.",
            },
            {
                q: "What if my hair doesn't respond the way the course suggests?",
                a: "Hair is individual. The courses are built around principles, not rigid protocols, so the goal is always to help you understand what's happening, not to hand you a script that may or may not fit your situation. If something isn't clicking, reach out. We're here.",
            },
            {
                q: "I've tried everything and nothing works. Is this actually different?",
                a: "Here's the honest answer: if you've tried everything and nothing has worked, the issue is almost certainly not the products; it's the framework. The Hair Insider doesn't add another thing to try. It gives you the lens to understand why things haven't worked, and how to evaluate what will.",
            },
            {
                q: "What makes this different from free YouTube content?",
                a: "Free content is built to get views, which means it's built to be interesting, not necessarily complete or structured. The Hair Insider is built to get you results. The difference is a curriculum designed around your understanding, not an algorithm designed around engagement. And Lauren isn't trying to sell you anything in the middle of it.",
            },
        ],
    },
];

export default function FaqClient() {
    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const { ref: contentRef, inView: contentIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
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
                    className='mx-auto max-w-6xl px-6 pb-14 pt-14'>
                    <FadeIn
                        inView={heroIn}
                        delayMs={100}>
                        <div className='space-y-6 bg-background/50 rounded-3xl p-6 max-w-3xl'>
                            <Badge
                                variant='secondary'
                                className='w-fit'>
                                Questions
                            </Badge>

                            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                FAQ
                            </h1>

                            <p className='text-lg leading-8'>
                                Everything you&apos;re wondering before you
                                decide. If something&apos;s still not answered
                                here,{" "}
                                <a
                                    href='/support'
                                    className='underline underline-offset-4'>
                                    reach out
                                </a>{" "}
                                and we&apos;ll get back to you.
                            </p>
                        </div>
                    </FadeIn>
                </section>

                {/* FAQ content */}
                <section
                    ref={contentRef}
                    className='border-t'>
                    <div className='mx-auto max-w-6xl px-6 py-14'>
                        <FadeIn
                            inView={contentIn}
                            delayMs={100}>
                            <div className='max-w-3xl space-y-12'>
                                {FAQ_SECTIONS.map(section => (
                                    <div key={section.label}>
                                        <p className='text-md text-secondary font-semibold uppercase tracking-wider mb-4'>
                                            {section.label}
                                        </p>
                                        <Separator className='mb-6' />
                                        <Accordion
                                            type='single'
                                            collapsible
                                            className='space-y-1'>
                                            {section.items.map((item, i) => (
                                                <AccordionItem
                                                    key={i}
                                                    value={`${section.label}-${i}`}
                                                    className='border bg-secondary rounded-2xl px-4'>
                                                    <AccordionTrigger className='text-md font-medium text-left py-4'>
                                                        {item.q}
                                                    </AccordionTrigger>
                                                    <AccordionContent className='text-sm leading-relaxed pb-4'>
                                                        {item.a}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
