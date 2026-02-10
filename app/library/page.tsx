"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

type EntitledCourseRow = {
    status: string;
    courses: {
        id: string;
        slug: string;
        title: string;
        subtitle: string | null;
        cover_image_url: string | null;
    }[];
};

export default function LibraryPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [items, setItems] = React.useState<EntitledCourseRow[]>([]);
    const [err, setErr] = React.useState<string | null>(null);

    React.useEffect(() => {
        const run = async () => {
            setErr(null);

            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                router.replace(
                    `/signin?next=${encodeURIComponent("/library")}`,
                );
                return;
            }

            const { data, error } = await supabase
                .from("entitlements")
                .select(
                    "status, courses:course_id (id, slug, title, subtitle, cover_image_url)",
                )
                .eq("status", "active");

            if (error) {
                setErr(error.message);
                setLoading(false);
                return;
            }

            setItems((data ?? []) as unknown as EntitledCourseRow[]);
            setLoading(false);
        };

        run();
    }, [router]);

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

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
                    <div className='flex items-end justify-between gap-6'>
                        <div>
                            <h1 className='text-3xl font-semibold tracking-tight'>
                                My Library
                            </h1>
                            <p className='mt-2'>
                                Your purchased courses live here.
                            </p>
                        </div>
                    </div>

                    <div className='mt-10'>
                        {loading ? (
                            <p className='text-sm text-muted-foreground'>
                                Loading…
                            </p>
                        ) : err ? (
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Couldn’t load your library
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='text-sm text-muted-foreground'>
                                    {err}
                                    <div className='mt-4'>
                                        <Button
                                            asChild
                                            variant='outline'>
                                            <Link href='/courses'>
                                                Browse courses
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : items.length === 0 ? (
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        No access yet
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='text-sm text-muted-foreground'>
                                    When you purchase a course, it will appear
                                    here.
                                    <div className='mt-4'>
                                        <Button asChild>
                                            <Link href='/courses'>
                                                Browse courses
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                {items
                                    .flatMap(row => row.courses ?? [])
                                    .filter(Boolean)
                                    .map(c => (
                                        <Link
                                            key={c.id}
                                            href={`/library/${c.slug}`}>
                                            <Card className='rounded-3xl transition-shadow hover:shadow-md'>
                                                <CardHeader>
                                                    <CardTitle className='text-lg'>
                                                        {c.title}
                                                    </CardTitle>
                                                    {c.subtitle ? (
                                                        <p className='text-sm text-muted-foreground'>
                                                            {c.subtitle}
                                                        </p>
                                                    ) : null}
                                                </CardHeader>
                                                <CardContent className='text-sm'>
                                                    Open course →
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                            </div>
                        )}
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
