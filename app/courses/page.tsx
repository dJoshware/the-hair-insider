"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

type Course = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
};

export default function CoursesPage() {
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const run = async () => {
            const { data, error } = await supabase
                .from("courses")
                .select(
                    "id, slug, title, subtitle, description, cover_image_url",
                )
                .eq("is_published", true)
                .order("created_at", { ascending: false });

            if (!error && data) setCourses(data);
            setLoading(false);
        };
        run();
    }, []);

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
                                Courses
                            </h1>
                            <p className='mt-2'>
                                Choose a course to learn, then unlock your
                                library access.
                            </p>
                        </div>
                    </div>

                    <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {loading ? (
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Loading…
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='text-sm text-muted-foreground'>
                                    Fetching published courses.
                                </CardContent>
                            </Card>
                        ) : courses.length === 0 ? (
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        No courses yet
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='text-sm text-muted-foreground'>
                                    Publish a course to see it here.
                                </CardContent>
                            </Card>
                        ) : (
                            courses.map(c => (
                                <Link
                                    key={c.id}
                                    href={`/courses/${c.slug}`}
                                    className='group'>
                                    <Card className='h-full rounded-3xl transition-shadow group-hover:shadow-md'>
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
                                        <CardContent className='text-sm text-muted-foreground'>
                                            {c.description ? (
                                                <p className='line-clamp-3'>
                                                    {c.description}
                                                </p>
                                            ) : (
                                                <p>
                                                    View details and access
                                                    options.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
