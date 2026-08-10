"use client";

import * as React from "react";
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
import { supabase } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/stripe/checkout";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TikTokIcon } from "@/components/site/SocialIcons";
import { CountdownCouponBanner } from "@/components/site/CountdownCouponBanner";
import { PRODUCT_PROMO_CODES } from "@/lib/promoConfig";
import { PRODUCT_FAQS } from "@/lib/productFaqs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

type Course = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    stripe_price_id: string | null;
    overview_video_url: string | null;
};

type Stats = {
    modulesCount: number;
    lessonsCount: number;
    durationSeconds: number;
};

function formatDuration(seconds: number) {
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `${h} hr ${rem} min` : `${h} hr`;
}

function CourseCard({
    course,
    owned,
    priceText,
    stats,
    buying,
    buyError,
    onBuy,
    splitImages,
    savingsBadge,
}: {
    course: Course;
    owned: boolean;
    priceText: string | null;
    stats: Stats | null;
    buying: boolean;
    buyError: string | null;
    onBuy: (slug: string) => void;
    splitImages?: [string | null, string | null];
    savingsBadge?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [faqOpen, setFaqOpen] = React.useState(false);
    const faqs = PRODUCT_FAQS[course.slug];

    return (
        <Card
            id={course.slug}
            className='rounded-3xl overflow-hidden p-0'>
            {splitImages ? (
                <div className='relative aspect-[16/10] w-full flex overflow-hidden'>
                    <div className='relative w-1/2 h-full'>
                        {splitImages[0] ? (
                            <Image
                                src={splitImages[0]}
                                alt='Mini course cover'
                                fill
                                className='object-cover'
                                priority
                            />
                        ) : (
                            <div className='w-full h-full bg-muted' />
                        )}
                    </div>
                    <div className='relative w-1/2 h-full'>
                        {splitImages[1] ? (
                            <Image
                                src={splitImages[1]}
                                alt='Workbook cover'
                                fill
                                className='object-cover'
                                priority
                            />
                        ) : (
                            <div className='w-full h-full bg-muted/60' />
                        )}
                    </div>
                </div>
            ) : course.cover_image_url ? (
                <div className='relative aspect-[16/10] w-full'>
                    <Image
                        src={course.cover_image_url}
                        alt={`${course.title} cover`}
                        fill
                        className='object-cover'
                        priority
                    />
                </div>
            ) : (
                <div className='flex aspect-[16/10] items-center justify-center bg-muted'>
                    <p className='text-sm'>Cover image</p>
                </div>
            )}

            <CardContent className='px-5 pb-1 space-y-4'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                        <h2 className='text-lg font-semibold leading-snug tracking-tight'>
                            {course.title}
                        </h2>
                        {course.subtitle && (
                            <p className='text-sm'>{course.subtitle}</p>
                        )}
                    </div>
                    {owned && (
                        <Badge className='shrink-0 bg-neutral-500'>Owned</Badge>
                    )}
                </div>

                {stats && (
                    <div className='flex items-center gap-4 text-xs'>
                        <span>{stats.lessonsCount} lessons</span>
                        <span>·</span>
                        <span>{formatDuration(stats.durationSeconds)}</span>
                    </div>
                )}

                {course.stripe_price_id && !owned && (
                    <div className='flex items-center gap-3'>
                        <p className='text-3xl font-semibold tracking-tight'>
                            {priceText ?? "$–"}
                        </p>
                        {savingsBadge && (
                            <span className='rounded-full bg-rose-500 text-white text-xs font-semibold px-3 py-1'>
                                {savingsBadge}
                            </span>
                        )}
                    </div>
                )}

                {owned && (
                    <p className='text-sm font-medium'>
                        You already own this course.
                    </p>
                )}

                <div className='flex flex-col gap-2'>
                    {owned ? (
                        <Button
                            asChild
                            className='w-full h-11'>
                            <Link href={`/library/${course.slug}`}>
                                Go to course
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            className='w-full h-11'
                            onClick={() => onBuy(course.slug)}
                            disabled={buying || !course.stripe_price_id}>
                            {buying ? "Redirecting…" : "Buy Now"}
                        </Button>
                    )}
                </div>

                {buyError && (
                    <p className='text-sm text-destructive'>{buyError}</p>
                )}

                <Separator />

                {faqs && faqs.length > 0 && (
                    <>
                        <button
                            type='button'
                            onClick={() => setFaqOpen(v => !v)}
                            className='flex w-full -mb-1 pb-2 items-center justify-between text-sm font-medium'>
                            FAQ
                            {faqOpen ? (
                                <ChevronUp className='h-4 w-4' />
                            ) : (
                                <ChevronDown className='h-4 w-4' />
                            )}
                        </button>

                        <div
                            className={[
                                "grid transition-all duration-300 ease-in-out",
                                faqOpen
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0",
                            ].join(" ")}>
                            <div className='overflow-hidden'>
                                <Accordion
                                    type='single'
                                    collapsible
                                    className='-mb-3'>
                                    {faqs.map((item, i) => (
                                        <AccordionItem
                                            key={i}
                                            value={`${course.slug}-faq-${i}`}>
                                            <AccordionTrigger className='text-sm text-left'>
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className='text-sm leading-relaxed'>
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>

                        <Separator />
                    </>
                )}

                <button
                    type='button'
                    onClick={() => setOpen(v => !v)}
                    className='flex w-full items-center justify-between text-sm font-medium'>
                    Product details
                    {open ? (
                        <ChevronUp className='h-4 w-4' />
                    ) : (
                        <ChevronDown className='h-4 w-4' />
                    )}
                </button>

                <div
                    className={[
                        "grid transition-all duration-300 ease-in-out",
                        open
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}>
                    <div className='overflow-hidden'>
                        <div className='space-y-4 py-1'>
                            {course.overview_video_url && (
                                <div className='rounded-2xl overflow-hidden aspect-video'>
                                    <iframe
                                        src={course.overview_video_url}
                                        className='w-full h-full'
                                        allow='autoplay; fullscreen; picture-in-picture'
                                        allowFullScreen
                                        title={`${course.title} overview`}
                                    />
                                </div>
                            )}

                            {course.description && (
                                <p className='text-sm leading-7'>
                                    {course.description}
                                </p>
                            )}

                            <div className='grid gap-3 sm:grid-cols-2 pb-3'>
                                <div className='rounded-2xl bg-muted p-4 space-y-2'>
                                    <p className='text-xs font-medium'>
                                        What you get
                                    </p>
                                    <ul className='space-y-1.5 text-xs'>
                                        <li>High-end industry knowledge</li>
                                        <li>Clear routine guidance</li>
                                        <li>Interactive digital guide</li>
                                        <li>Lifetime access</li>
                                    </ul>
                                </div>
                                <div className='rounded-2xl bg-muted p-4 space-y-2'>
                                    <p className='text-xs font-medium'>
                                        Who it&apos;s for
                                    </p>
                                    <ul className='space-y-1.5 text-xs'>
                                        <li>People tired of guessing</li>
                                        <li>Anyone wanting healthier length</li>
                                        <li>
                                            Busy routines needing simplicity
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function WorkbookCard({
    course,
    owned,
    priceText,
    buying,
    buyError,
    onBuy,
    href = "/workbook",
    ownedCta = "Open digital workbook →",
    buyCta = "Get the digital workbook",
    detailNote = "Already own the mini course? Add the digital workbook to your toolkit, sold separately.",
    promoCode,
    founderSeats,
    priceCents,
    founderDiscountCents,
}: {
    course: Course;
    owned: boolean;
    priceText: string | null;
    buying: boolean;
    buyError: string | null;
    onBuy: (slug: string) => void;
    href?: string;
    ownedCta?: string;
    buyCta?: string;
    detailNote?: string;
    promoCode?: string;
    founderSeats?: { claimed: number; total: number };
    priceCents?: { amount: number; currency: string };
    founderDiscountCents?: number;
}) {
    const founderSeatsRemaining =
        !!founderSeats && founderSeats.claimed < founderSeats.total;
    const founderPriceText =
        founderSeatsRemaining && priceCents && founderDiscountCents
            ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: priceCents.currency.toUpperCase(),
              }).format(
                  Math.max(0, priceCents.amount - founderDiscountCents) / 100,
              )
            : null;
    const [open, setOpen] = React.useState(false);
    const [faqOpen, setFaqOpen] = React.useState(false);
    const faqs = PRODUCT_FAQS[course.slug];

    return (
        <Card
            id={course.slug}
            className='rounded-3xl overflow-hidden p-0'>
            {course.cover_image_url ? (
                <div className='relative aspect-[16/10] w-full'>
                    <Image
                        src={course.cover_image_url}
                        alt={`${course.title} cover`}
                        fill
                        className='object-cover'
                        priority
                    />
                </div>
            ) : (
                <div className='flex aspect-[16/10] items-center justify-center bg-muted'>
                    <p className='text-sm'>Cover image</p>
                </div>
            )}
            <CardContent className='px-5 pb-3 space-y-4'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                        <h3 className='text-lg font-semibold leading-snug'>
                            {course.title}
                        </h3>
                        {course.subtitle && (
                            <p className='text-sm'>{course.subtitle}</p>
                        )}
                    </div>
                    {owned && (
                        <Badge className='shrink-0 bg-neutral-500'>Owned</Badge>
                    )}
                </div>

                {promoCode && !owned && (
                    <CountdownCouponBanner
                        code={promoCode}
                        className='text-xs px-3 py-2'
                    />
                )}

                {founderSeats && (
                    <div className='space-y-1.5'>
                        <div className='flex items-center justify-between text-xs font-medium'>
                            <span>
                                {founderSeats.claimed >= founderSeats.total
                                    ? "Founders claimed"
                                    : "Founders"}
                            </span>
                            <span>
                                {Math.min(
                                    founderSeats.claimed,
                                    founderSeats.total,
                                )}
                                /{founderSeats.total} claimed
                            </span>
                        </div>
                        <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                            <div
                                className='h-full rounded-full bg-amber-500'
                                style={{
                                    width: `${Math.min(100, (founderSeats.claimed / founderSeats.total) * 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {course.stripe_price_id && !owned && founderPriceText && (
                    <div className='flex items-center gap-2 flex-wrap'>
                        <span className='text-3xl font-semibold tracking-tight'>
                            {founderPriceText}
                        </span>
                        <span className='text-lg text-muted-foreground line-through'>
                            {priceText ?? "$–"}
                        </span>
                        <span className='text-xs font-semibold text-amber-600'>
                            <em>for founders</em>
                        </span>
                    </div>
                )}

                {course.stripe_price_id && !owned && !founderPriceText && (
                    <p className='text-3xl font-semibold tracking-tight'>
                        {priceText ?? "$–"}
                    </p>
                )}

                {owned && (
                    <p className='text-sm font-medium'>
                        You already own this item.
                    </p>
                )}

                {owned ? (
                    <Button
                        asChild
                        className='w-full h-11'>
                        <Link href={href}>{ownedCta}</Link>
                    </Button>
                ) : (
                    <Button
                        className='w-full h-11'
                        onClick={() => onBuy(course.slug)}
                        disabled={buying || !course.stripe_price_id}>
                        {buying ? "Redirecting…" : buyCta}
                    </Button>
                )}

                {buyError && (
                    <p className='text-sm text-destructive'>{buyError}</p>
                )}

                <Separator />

                {faqs && faqs.length > 0 && (
                    <>
                        <button
                            type='button'
                            onClick={() => setFaqOpen(v => !v)}
                            className='flex w-full -mb-1 pb-2 items-center justify-between text-sm font-medium'>
                            FAQ
                            {faqOpen ? (
                                <ChevronUp className='h-4 w-4' />
                            ) : (
                                <ChevronDown className='h-4 w-4' />
                            )}
                        </button>

                        <div
                            className={[
                                "grid transition-all duration-300 ease-in-out",
                                faqOpen
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0",
                            ].join(" ")}>
                            <div className='overflow-hidden'>
                                <Accordion
                                    type='single'
                                    collapsible
                                    className='-mb-3'>
                                    {faqs.map((item, i) => (
                                        <AccordionItem
                                            key={i}
                                            value={`${course.slug}-faq-${i}`}>
                                            <AccordionTrigger className='text-sm text-left'>
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className='text-sm leading-relaxed'>
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>

                        <Separator />
                    </>
                )}

                <button
                    type='button'
                    onClick={() => setOpen(v => !v)}
                    className='flex w-full items-center justify-between text-sm font-medium'>
                    Product details
                    {open ? (
                        <ChevronUp className='h-4 w-4' />
                    ) : (
                        <ChevronDown className='h-4 w-4' />
                    )}
                </button>

                <div
                    className={[
                        "grid transition-all duration-300 ease-in-out",
                        open
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}>
                    <div className='overflow-hidden'>
                        <div className='space-y-4 py-1'>
                            {course.description && (
                                <p className='text-sm leading-7'>
                                    {course.description}
                                </p>
                            )}
                            <p className='text-xs'>{detailNote}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function HomeClient() {
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [coursesLoading, setCoursesLoading] = React.useState(true);
    const [ownedCourseIds, setOwnedCourseIds] = React.useState<Set<string>>(
        new Set(),
    );
    const [prices, setPrices] = React.useState<Record<string, string>>({});
    const [priceCents, setPriceCents] = React.useState<
        Record<string, { amount: number; currency: string }>
    >({});
    const [stats, setStats] = React.useState<Record<string, Stats>>({});
    const [buying, setBuying] = React.useState<string | null>(null);
    const [buyErrors, setBuyErrors] = React.useState<Record<string, string>>(
        {},
    );
    const [founderSeats, setFounderSeats] = React.useState<{
        claimed: number;
        total: number;
    } | null>(null);

    React.useEffect(() => {
        fetch("/api/founder-count")
            .then(res => (res.ok ? res.json() : null))
            .then(json => {
                if (json) setFounderSeats(json);
            })
            .catch(() => {});
    }, []);

    React.useEffect(() => {
        function handleShopClick(e: MouseEvent) {
            const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
                'a[href="#shop"], a[href="/#shop"]',
            );
            if (!anchor) return;
            e.preventDefault();
            history.replaceState(null, "", "/");
            window.location.hash = "shop";
        }
        document.addEventListener("click", handleShopClick);
        return () => document.removeEventListener("click", handleShopClick);
    }, []);

    React.useEffect(() => {
        const run = async () => {
            setCoursesLoading(true);

            const [{ data: sessionData }, coursesRes] = await Promise.all([
                supabase.auth.getSession(),
                supabase
                    .from("courses")
                    .select(
                        "id, slug, title, subtitle, description, cover_image_url, stripe_price_id, overview_video_url",
                    )
                    .eq("is_published", true)
                    .order("created_at", { ascending: false }),
            ]);

            if (!coursesRes.error && coursesRes.data) {
                setCourses(coursesRes.data);

                coursesRes.data.forEach(async c => {
                    const statsRes = await fetch(
                        `/api/courses/${encodeURIComponent(c.slug)}/stats`,
                    );
                    if (statsRes.ok) {
                        const json = await statsRes.json();
                        setStats(prev => ({ ...prev, [c.id]: json }));
                    }

                    if (c.stripe_price_id) {
                        const priceRes = await fetch("/api/stripe/price", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                priceId: c.stripe_price_id,
                            }),
                        });
                        if (priceRes.ok) {
                            const json = await priceRes.json();
                            if (json.unitAmount != null) {
                                const formatted = new Intl.NumberFormat(
                                    "en-US",
                                    {
                                        style: "currency",
                                        currency: json.currency.toUpperCase(),
                                    },
                                ).format(json.unitAmount / 100);
                                setPrices(prev => ({
                                    ...prev,
                                    [c.id]: formatted,
                                }));
                                setPriceCents(prev => ({
                                    ...prev,
                                    [c.id]: {
                                        amount: json.unitAmount,
                                        currency: json.currency,
                                    },
                                }));
                            }
                        }
                    }
                });
            }

            const userId = sessionData.session?.user?.id;
            if (userId) {
                const { data: ents } = await supabase
                    .from("entitlements")
                    .select("course_id")
                    .eq("user_id", userId)
                    .eq("status", "active");
                if (ents)
                    setOwnedCourseIds(new Set(ents.map(e => e.course_id)));
            }

            setCoursesLoading(false);
        };

        run();
    }, []);

    async function onBuy(slug: string) {
        const course = courses.find(c => c.slug === slug);
        if (!course) return;

        setBuyErrors(prev => {
            const n = { ...prev };
            delete n[course.id];
            return n;
        });
        setBuying(slug);

        try {
            await startCheckout(slug);
        } catch (err) {
            setBuyErrors(prev => ({
                ...prev,
                [course.id]:
                    err instanceof Error ? err.message : "Checkout failed.",
            }));
        } finally {
            setBuying(null);
        }
    }

    const { ref: heroRef, inView: heroIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    const { ref: manifestoRef, inView: manifestoIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    const { ref: shopRef, inView: shopIn } = useInView({
        triggerOnce: true,
        threshold: 0.05,
    });
    const { ref: educatorRef, inView: educatorIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <>
            <OrgJsonLd />

            <div className='relative min-h-[100dvh] text-foreground'>
                <Overlay />
                <Navbar />
                {PRODUCT_PROMO_CODES["hair-growth-edit"] && (
                    <div className='mx-auto max-w-6xl px-6 pt-4'>
                        <CountdownCouponBanner
                            code={PRODUCT_PROMO_CODES["hair-growth-edit"]}
                            productName='The Growth Edit'
                        />
                    </div>
                )}
                <SiteBreadcrumbs />

                <main>
                    {/* Products */}
                    <section
                        ref={shopRef}
                        id='shop'
                        className='min-h-[100dvh] flex flex-col justify-center'>
                        <div className='mx-auto max-w-6xl px-6 py-20 w-full'>
                            <FadeIn
                                inView={shopIn}
                                delayMs={150}>
                                {(() => {
                                    const bundleCourse = courses.find(
                                        c => c.slug === "hair-growth-bundle",
                                    );
                                    const workbookCourse = courses.find(
                                        c => c.slug === "hair-growth-workbook",
                                    );
                                    const miniCourse = courses.find(
                                        c =>
                                            c.slug ===
                                            "hair-growth-foundations-mini-course",
                                    );
                                    const growthEditCourse = courses.find(
                                        c => c.slug === "hair-growth-edit",
                                    );

                                    if (
                                        coursesLoading ||
                                        courses.length === 0
                                    ) {
                                        return (
                                            <Card className='rounded-3xl'>
                                                <CardContent className='pt-6 text-sm'>
                                                    {coursesLoading
                                                        ? "Loading…"
                                                        : "Nothing available yet."}
                                                </CardContent>
                                            </Card>
                                        );
                                    }

                                    return (
                                        <div className='space-y-10'>
                                            {/* Header */}
                                            <div className='space-y-3 bg-background/50 rounded-3xl p-6'>
                                                <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                                                    Learn it. Then live it.
                                                </h2>
                                                <p className='text-lg max-w-2xl'>
                                                    The mini course teaches you
                                                    the science behind your
                                                    hair. The digital workbook
                                                    puts it into practice,
                                                    daily guided journaling,
                                                    habit tracking, and progress
                                                    reviews. Get both together
                                                    at a discount.
                                                </p>
                                                <p className='text-sm'>
                                                    Not sure yet?{" "}
                                                    <a
                                                        href='https://www.tiktok.com/@lifewith.laurenj'
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        className='underline underline-offset-4 hover:opacity-70 transition-opacity'>
                                                        See Lauren&apos;s
                                                        content on TikTok →
                                                    </a>
                                                </p>
                                            </div>

                                            {/* Cards row */}
                                            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start'>
                                                {growthEditCourse && (
                                                    <WorkbookCard
                                                        course={
                                                            growthEditCourse
                                                        }
                                                        owned={ownedCourseIds.has(
                                                            growthEditCourse.id,
                                                        )}
                                                        priceText={
                                                            prices[
                                                                growthEditCourse
                                                                    .id
                                                            ] ?? null
                                                        }
                                                        buying={
                                                            buying ===
                                                            growthEditCourse.slug
                                                        }
                                                        buyError={
                                                            buyErrors[
                                                                growthEditCourse
                                                                    .id
                                                            ] ?? null
                                                        }
                                                        onBuy={onBuy}
                                                        href='/hair-growth-edit'
                                                        ownedCta='Open The Growth Edit →'
                                                        buyCta='Get Your Growth Edit'
                                                        detailNote='Find your hair type and get a matched, salon-grade product routine, with professional picks and an affordable match for every step.'
                                                        promoCode={
                                                            PRODUCT_PROMO_CODES[
                                                                "hair-growth-edit"
                                                            ]
                                                        }
                                                        founderSeats={
                                                            founderSeats ??
                                                            undefined
                                                        }
                                                        priceCents={
                                                            priceCents[
                                                                growthEditCourse
                                                                    .id
                                                            ]
                                                        }
                                                        founderDiscountCents={
                                                            2000
                                                        }
                                                    />
                                                )}
                                                {bundleCourse && (
                                                    <CourseCard
                                                        course={bundleCourse}
                                                        owned={ownedCourseIds.has(
                                                            bundleCourse.id,
                                                        )}
                                                        priceText={
                                                            prices[
                                                                bundleCourse.id
                                                            ] ?? null
                                                        }
                                                        stats={null}
                                                        buying={
                                                            buying ===
                                                            bundleCourse.slug
                                                        }
                                                        buyError={
                                                            buyErrors[
                                                                bundleCourse.id
                                                            ] ?? null
                                                        }
                                                        onBuy={onBuy}
                                                        splitImages={[
                                                            miniCourse?.cover_image_url ??
                                                                null,
                                                            workbookCourse?.cover_image_url ??
                                                                null,
                                                        ]}
                                                        savingsBadge='Save 10%'
                                                    />
                                                )}
                                                {miniCourse && (
                                                    <CourseCard
                                                        course={miniCourse}
                                                        owned={ownedCourseIds.has(
                                                            miniCourse.id,
                                                        )}
                                                        priceText={
                                                            prices[
                                                                miniCourse.id
                                                            ] ?? null
                                                        }
                                                        stats={
                                                            stats[
                                                                miniCourse.id
                                                            ] ?? null
                                                        }
                                                        buying={
                                                            buying ===
                                                            miniCourse.slug
                                                        }
                                                        buyError={
                                                            buyErrors[
                                                                miniCourse.id
                                                            ] ?? null
                                                        }
                                                        onBuy={onBuy}
                                                    />
                                                )}
                                                {workbookCourse && (
                                                    <WorkbookCard
                                                        course={workbookCourse}
                                                        owned={ownedCourseIds.has(
                                                            workbookCourse.id,
                                                        )}
                                                        priceText={
                                                            prices[
                                                                workbookCourse
                                                                    .id
                                                            ] ?? null
                                                        }
                                                        buying={
                                                            buying ===
                                                            workbookCourse.slug
                                                        }
                                                        buyError={
                                                            buyErrors[
                                                                workbookCourse
                                                                    .id
                                                            ] ?? null
                                                        }
                                                        onBuy={onBuy}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </FadeIn>
                        </div>
                    </section>


                    {/* Hero */}
                    <section
                        ref={heroRef}
                        className='flex flex-col min-h-[calc(100dvh-64px)] border-t'>
                        <div className='flex-1 flex items-center mx-auto w-full max-w-6xl px-6 py-16'>
                            <FadeIn
                                inView={heroIn}
                                delayMs={100}
                                className='w-full'>
                                <div className='grid gap-10 md:grid-cols-2 md:items-center'>
                                    <div className='space-y-6 bg-background/50 rounded-3xl p-8'>
                                        <p className='text-xs font-semibold uppercase tracking-widest'>
                                            Education-first hair care
                                        </p>
                                        <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
                                            The Education Your Salon Appointment
                                            Never Came With.
                                        </h1>
                                        <p className='max-w-xl text-lg leading-8'>
                                            The Hair Insider is a private course
                                            library that teaches you the{" "}
                                            <em>why</em> behind your hair, so
                                            you stop starting over and finally
                                            build a routine that works.
                                        </p>

                                        <ul className='space-y-2 text-sm'>
                                            <li className='flex items-start gap-2'>
                                                <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground' />
                                                <span>
                                                    Understand porosity,
                                                    breakage, shedding, and
                                                    moisture, the things your
                                                    stylist learned in school
                                                    that nobody passed on to
                                                    you.
                                                </span>
                                            </li>
                                            <li className='flex items-start gap-2'>
                                                <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground' />
                                                <span>
                                                    Build a simple, repeatable
                                                    routine with what you
                                                    already own, no new
                                                    products required.
                                                </span>
                                            </li>
                                            <li className='flex items-start gap-2'>
                                                <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground' />
                                                <span>
                                                    Know how to troubleshoot
                                                    when something changes,
                                                    instead of starting from
                                                    scratch.
                                                </span>
                                            </li>
                                        </ul>

                                        <div className='flex flex-col gap-3 sm:flex-row'>
                                            <Button
                                                asChild
                                                className='h-12 px-6'>
                                                <Link href='/#shop'>Shop</Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant='secondary'
                                                className='h-12 px-6'>
                                                <Link href='/7-day-moisture-reset'>
                                                    Start the free digital guide
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    <Card className='rounded-3xl'>
                                        <CardHeader className='flex-row items-center justify-between'>
                                            <CardTitle className='text-base'>
                                                Included In The Course
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <ul className='space-y-4 text-sm'>
                                                <li>
                                                    <p className='font-medium text-foreground'>
                                                        The &ldquo;aha&rdquo;
                                                        moment
                                                    </p>
                                                    <p className='mt-1'>
                                                        Finally understand why
                                                        your hair does what it
                                                        does, not just what to
                                                        do about it.
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className='font-medium text-foreground'>
                                                        A routine you&apos;ll
                                                        actually stick to
                                                    </p>
                                                    <p className='mt-1'>
                                                        Simple, repeatable, and
                                                        built around your life,
                                                        not an influencer&apos;s
                                                        10-step process.
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className='font-medium text-foreground'>
                                                        Workbook that comes home
                                                        with you
                                                    </p>
                                                </li>
                                            </ul>

                                            <Separator />

                                            <div className='rounded-2xl bg-muted p-4'>
                                                <p className='text-xs font-medium'>
                                                    Your stylist knows this.
                                                </p>
                                                <p className='mt-1 text-sm text-foreground'>
                                                    Now you will too.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </FadeIn>
                        </div>

                        {/* Bottom trust strip */}
                        <div className='bg-background/50'>
                            <div className='mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-semibold'>
                                <span>One purchase</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>Lifetime access</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>Instant unlock</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>No subscription</span>
                                <span className='hidden sm:inline'>·</span>
                                <span>7-day money-back guarantee</span>
                            </div>
                        </div>
                    </section>

                    {/* Manifesto */}
                    <section
                        ref={manifestoRef}
                        className='min-h-[100dvh] flex flex-col justify-center border-t'>
                        <div className='mx-auto max-w-6xl px-6 py-20 w-full'>
                            <FadeIn
                                inView={manifestoIn}
                                delayMs={150}>
                                <div className='bg-background/50 p-6 mb-6 rounded-3xl'>
                                    <p className='text-sm font-semibold uppercase tracking-widest mb-4'>
                                        Why it exists
                                    </p>

                                    <p className='text-3xl sm:text-4xl font-semibold italic leading-tight max-w-3xl'>
                                        &ldquo;The hair industry runs on what
                                        you don&apos;t know. We&apos;re closing
                                        that gap.&rdquo;
                                    </p>
                                </div>

                                <div className='grid gap-4 md:grid-cols-3'>
                                    {[
                                        {
                                            stat: "01",
                                            claim: "You don\u2019t have a product problem.",
                                            detail: "You have a knowledge problem. The average person buys new products trying to fix something that no product was ever going to fix. We teach you what\u2019s actually happening instead.",
                                        },
                                        {
                                            stat: "02",
                                            claim: "Your stylist\u2019s knowledge shouldn\u2019t be a secret.",
                                            detail: "The hair industry runs on information asymmetry \u2014 stylists know things clients don\u2019t, and that gap is where trial and error lives. Lauren bridges it.",
                                        },
                                        {
                                            stat: "03",
                                            claim: "Simple routines work. Complicated ones don\u2019t.",
                                            detail: "Consistency beats complexity every time. The 10-step routine is a product company\u2019s dream. A 3-step routine you actually do is yours.",
                                        },
                                    ].map(item => (
                                        <Card
                                            key={item.stat}
                                            className='rounded-3xl'>
                                            <CardHeader>
                                                <p className='text-xs font-medium'>
                                                    {item.stat}
                                                </p>
                                                <CardTitle className='text-lg leading-snug'>
                                                    {item.claim}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='text-sm leading-relaxed'>
                                                {item.detail}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className='mt-12 flex flex-col sm:flex-row sm:items-center gap-6'>
                                    <Button
                                        asChild
                                        variant='default'
                                        className='h-12 px-6'>
                                        <Link href='/what-is-it'>
                                            Learn more
                                        </Link>
                                    </Button>
                                    <p className='text-sm font-semibold bg-background/50 rounded-xl p-3'>
                                        Education-first &middot; Product-neutral
                                        &middot; Built by a licensed stylist
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* Educator */}
                    <section
                        ref={educatorRef}
                        id='educator'
                        className='min-h-[100dvh] flex items-center border-t'>
                        <div className='mx-auto max-w-6xl px-6 py-20 w-full'>
                            <FadeIn
                                inView={educatorIn}
                                delayMs={200}>
                                <div className='grid gap-10 md:grid-cols-2 md:items-stretch'>
                                    <div className='space-y-6 bg-background/50 rounded-3xl p-8 flex flex-col justify-between'>
                                        <div className='space-y-5'>
                                            <p className='text-sm font-semibold uppercase tracking-widest'>
                                                Meet your educator
                                            </p>
                                            <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                                                Lauren Jackson
                                            </h2>
                                            <p className='text-xl leading-8 italic font-medium'>
                                                &ldquo;I was a licensed stylist,
                                                and I still didn&apos;t know how
                                                to grow my own hair.&rdquo;
                                            </p>
                                            <p className='text-base leading-8'>
                                                Lauren is a licensed
                                                cosmetologist with 8 years
                                                behind the chair. She built The
                                                Hair Insider because she kept
                                                watching clients leave salons
                                                confused, with instructions,
                                                but no understanding.
                                            </p>
                                            <p className='text-base leading-8'>
                                                What she saw over and over
                                                wasn&apos;t a product problem.
                                                It was a clarity problem.
                                            </p>
                                        </div>

                                        <div className='space-y-6'>
                                            <div className='grid grid-cols-2 gap-3'>
                                                {[
                                                    {
                                                        label: "Specialty",
                                                        value: "Color + Extensions",
                                                    },
                                                    {
                                                        label: "Experience",
                                                        value: "8 years behind the chair",
                                                    },
                                                    {
                                                        label: "Approach",
                                                        value: "Routine-based education",
                                                    },
                                                    {
                                                        label: "Focus",
                                                        value: "Health + length retention",
                                                    },
                                                ].map(item => (
                                                    <div
                                                        key={item.label}
                                                        className='rounded-2xl bg-muted p-4'>
                                                        <p className='text-xs font-medium'>
                                                            {item.label}
                                                        </p>
                                                        <p className='mt-1 text-sm'>
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                asChild
                                                className='h-12 px-6'>
                                                <Link href='/meet-your-educator'>
                                                    Her Story
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className='rounded-3xl border bg-card shadow-sm overflow-hidden flex flex-col'>
                                        <div className='relative flex-1 min-h-[400px]'>
                                            <Image
                                                src='/Lauren_headshot.jpg'
                                                alt='Lauren Jackson, founder of The Hair Insider'
                                                fill
                                                className='object-cover'
                                                sizes='(min-width: 768px) 520px, 100vw'
                                                priority={false}
                                            />
                                        </div>

                                        <div className='p-6 space-y-2'>
                                            <p className='text-sm font-semibold'>
                                                Lauren Jackson
                                            </p>
                                            <p className='text-xs'>
                                                Founder &amp; Educator, The Hair
                                                Insider
                                            </p>
                                            <div className='flex flex-wrap gap-3 pt-1'>
                                                <a
                                                    href='https://www.tiktok.com/@lifewith.laurenj'
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className='inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:opacity-70 transition-opacity'>
                                                    <TikTokIcon className='h-3.5 w-3.5 shrink-0' />
                                                    @lifewith.laurenj
                                                </a>
                                                <a
                                                    href='https://www.tiktok.com/@thehairinsider'
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className='inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:opacity-70 transition-opacity'>
                                                    <TikTokIcon className='h-3.5 w-3.5 shrink-0' />
                                                    @thehairinsider
                                                </a>
                                            </div>
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
