"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/stripe/checkout";
import { useAuth } from "@/lib/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Navbar } from "@/components/site/navbar";

type Course = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    stripe_price_id: string | null;
};

export default function CourseDetailClient({
    slug,
    initialCourse,
}: {
    slug: string;
    initialCourse: Course | null;
}) {
    const [owned, setOwned] = React.useState(false);
    const [course, setCourse] = React.useState<Course | null>(initialCourse);
    const [priceText, setPriceText] = React.useState<string | null>(null);
    const [buying, setBuying] = React.useState(false);
    const [buyError, setBuyError] = React.useState<string | null>(null);
    const { signedIn, loading: authLoading } = useAuth();
    const [loading, setLoading] = React.useState(!initialCourse);
    const [notFound, setNotFound] = React.useState(false);

    async function onGetAccess() {
        if (!course) return;
        if (owned) return;

        setBuyError(null);
        setBuying(true);

        try {
            await startCheckout(course.slug);
        } catch (err) {
            setBuyError(
                err instanceof Error ? err.message : "Checkout failed.",
            );
            setBuying(false);
        }
    }

    React.useEffect(() => {
        if (!slug) return;
        if (initialCourse) return;

        const run = async () => {
            setLoading(true);
            setNotFound(false);

            const { data, error } = await supabase
                .from("courses")
                .select(
                    "id, slug, title, subtitle, description, cover_image_url, stripe_price_id",
                )
                .eq("slug", slug)
                .eq("is_published", true)
                .maybeSingle();

            if (error) {
                // If there's an error, treat as not found for MVP
                setNotFound(true);
                setCourse(null);
                setLoading(false);
                return;
            }

            if (!data) {
                setNotFound(true);
                setCourse(null);
                setLoading(false);
                return;
            }

            setCourse(data);
            setLoading(false);
        };

        run();
    }, [slug, initialCourse]);

    React.useEffect(() => {
        const run = async () => {
            if (!course?.stripe_price_id) return;

            const res = await fetch("/api/stripe/price", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: course.stripe_price_id }),
            });

            if (!res.ok) {
                setPriceText(null);
                return;
            }

            const json = (await res.json()) as {
                unitAmount: number | null;
                currency: string;
            };

            if (json.unitAmount == null) {
                setPriceText(null);
                return;
            }

            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: json.currency.toUpperCase(),
            }).format(json.unitAmount / 100);

            setPriceText(formatted);
        };

        run();
    }, [course?.stripe_price_id]);

    React.useEffect(() => {
        const run = async () => {
            if (!course?.id) {
                setOwned(false);
                return;
            }

            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user?.id;

            if (!userId) {
                setOwned(false);
                return;
            }

            const { data: ent } = await supabase
                .from("entitlements")
                .select("id")
                .eq("user_id", userId)
                .eq("course_id", course.id)
                .eq("status", "active")
                .maybeSingle();

            setOwned(!!ent);
        };

        run();
    }, [course?.id]);

    React.useEffect(() => {
        const onFocus = () => setOwned(prev => prev);
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    if (loading) {
        return (
            <div className='mx-auto max-w-6xl px-6 py-14'>
                <p className='text-sm text-muted-foreground'>Loading course…</p>
            </div>
        );
    }

    if (notFound || !course) {
        return (
            <div className='mx-auto max-w-6xl px-6 py-14'>
                <h1 className='text-2xl font-semibold tracking-tight'>
                    Course not found
                </h1>
                <p className='mt-2 text-muted-foreground'>
                    This course may be unpublished or the link is incorrect.
                </p>
                <div className='mt-6'>
                    <Button
                        asChild
                        variant='outline'>
                        <Link href='/courses'>Back to courses</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            {/* Fixed background and overlay layer */}
            <Overlay />

            {/* Main content */}
            <Navbar />

            {/* Breadcrumbs */}
            <SiteBreadcrumbs />
            <div
                ref={pageRef}
                className='mx-auto max-w-6xl px-6 pt-8'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex flex-col gap-10 md:flex-row md:items-start md:justify-between'>
                        {/* Left: Content */}
                        <div className='max-w-2xl'>
                            <div className='flex items-center gap-3'>
                                <Badge variant='secondary'>Course</Badge>
                                {owned ? (
                                    <Badge variant='default'>Owned</Badge>
                                ) : null}
                            </div>

                            <h1 className='mt-4 text-3xl font-semibold tracking-tight sm:text-4xl'>
                                {course.title}
                            </h1>

                            {course.subtitle ? (
                                <p className='mt-3 text-lg'>
                                    {course.subtitle}
                                </p>
                            ) : null}

                            {course.description ? (
                                <p className='mt-6 text-base leading-7'>
                                    {course.description}
                                </p>
                            ) : (
                                <p className='mt-6 text-base leading-7'>
                                    A short, structured mini-course designed to
                                    help you stop guessing and build a routine
                                    that makes sense.
                                </p>
                            )}

                            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:items-center'>
                                {owned ? (
                                    <>
                                        <Button
                                            asChild
                                            variant='secondary'
                                            className='h-12 px-6'>
                                            <Link href={`/library/${slug}`}>
                                                Go to course
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            className='h-12 px-6'
                                            onClick={onGetAccess}
                                            disabled={
                                                buying ||
                                                !course.stripe_price_id
                                            }>
                                            {buying
                                                ? "Redirecting…"
                                                : "BUY NOW"}
                                        </Button>

                                        <Button
                                            asChild
                                            variant='secondary'
                                            className='h-12 px-6'>
                                            <Link href='/library'>
                                                Go to library
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>

                            {buyError ? (
                                <p className='mt-3 text-sm text-destructive'>
                                    {buyError}
                                </p>
                            ) : null}

                            {!authLoading && !signedIn ? (
                                <p className='mt-4 text-sm'>
                                    Already purchased?{" "}
                                    <Link
                                        href='/signin'
                                        className='font-medium text-foreground underline underline-offset-4'>
                                        Sign in
                                    </Link>
                                    .
                                </p>
                            ) : null}

                            <Separator className='my-10' />

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <Card className='rounded-3xl'>
                                    <CardHeader>
                                        <CardTitle className='text-base'>
                                            What you get
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='text-sm text-muted-foreground'>
                                        <ul className='space-y-2'>
                                            <li>4 short video lessons</li>
                                            <li>Clear routine guidance</li>
                                            <li>Access inside your library</li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className='rounded-3xl'>
                                    <CardHeader>
                                        <CardTitle className='text-base'>
                                            Who it’s for
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='text-sm text-muted-foreground'>
                                        <ul className='space-y-2'>
                                            <li>People tired of guessing</li>
                                            <li>
                                                Anyone wanting healthier length
                                            </li>
                                            <li>
                                                Busy routines that need
                                                simplicity
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Right: Cover */}
                        <div className='w-full max-w-md'>
                            <Card className='overflow-hidden rounded-3xl mb-10 py-0'>
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

                                <CardContent className='space-y-4 p-6'>
                                    <p className='text-sm font-medium'>
                                        Mini-course format
                                    </p>
                                    <p className='text-sm text-muted-foreground'>
                                        One course, four lessons. Clean
                                        structure. Easy to finish.
                                    </p>

                                    <Separator />

                                    <div className='space-y-2 text-sm text-muted-foreground'>
                                        <div className='flex items-center justify-between'>
                                            <span>Lessons</span>
                                            <span className='text-foreground'>
                                                4
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span>Access</span>
                                            <span className='text-foreground'>
                                                Library
                                            </span>
                                        </div>
                                    </div>

                                    {!owned ? (
                                        <Button
                                            className='h-12 px-6'
                                            onClick={onGetAccess}
                                            disabled={
                                                buying ||
                                                !course.stripe_price_id
                                            }>
                                            {buying
                                                ? "Redirecting…"
                                                : "BUY NOW"}
                                        </Button>
                                    ) : (
                                        ""
                                    )}

                                    {buyError ? (
                                        <p className='mt-3 text-sm text-destructive'>
                                            {buyError}
                                        </p>
                                    ) : null}

                                    {course.stripe_price_id ? (
                                        owned ? (
                                            <div className='flex items-center justify-between pb-2'>
                                                <span className='text-foreground text-md font-semibold'>
                                                    You already own this course.
                                                </span>
                                            </div>
                                        ) : (
                                            <div className='flex items-center justify-between pb-2'>
                                                <span>Price</span>
                                                <span className='text-foreground text-4xl font-semibold'>
                                                    {priceText ?? "—"}
                                                </span>
                                            </div>
                                        )
                                    ) : (
                                        <p className='text-xs'>
                                            Price not set yet.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
