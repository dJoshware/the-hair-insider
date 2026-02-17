"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

type CourseRow = {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    is_published: boolean;
    cover_image_url: string | null;
    created_at?: string | null;
};

export default function CoursesClient() {
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);
    const [courses, setCourses] = React.useState<CourseRow[]>([]);

    const { ready } = useAdminGuard();

    React.useEffect(() => {
        if (!ready) return;

        (async () => {
            setLoading(true);
            setErr(null);

            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) return; // guard should've redirected already

            const res = await fetch("/api/admin/courses", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();
            if (!res.ok) {
                setErr(json.error || "Failed to load courses.");
                setLoading(false);
                return;
            }

            setCourses(json.courses ?? []);
            setLoading(false);
        })();
    }, [ready]);

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
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <Badge variant='secondary'>Admin</Badge>
                            </div>
                            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>
                                Manage courses
                            </h1>
                            <p className='mt-2'>
                                Create, edit, publish, and manage lessons.
                            </p>
                        </div>

                        <div className='flex gap-3'>
                            <Button asChild>
                                <Link href='/admin/courses/new'>
                                    New course
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant='secondary'>
                                <Link href='/library'>Library</Link>
                            </Button>
                        </div>
                    </div>

                    <Separator className='my-8' />

                    {loading ? (
                        <p className='text-sm'>Loading…</p>
                    ) : err ? (
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    Couldn’t load courses
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='text-sm'>{err}</CardContent>
                        </Card>
                    ) : courses.length === 0 ? (
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    No courses yet
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='text-sm text-muted-foreground'>
                                Create your first course to start adding
                                lessons.
                                <div className='mt-4'>
                                    <Button asChild>
                                        <Link href='/admin/courses/new'>
                                            Create a course
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='grid gap-4 mb-6'>
                            {courses.map(c => (
                                <Card
                                    key={c.id}
                                    className='rounded-3xl'>
                                    <CardHeader className='flex-row items-start justify-between space-y-0'>
                                        <div className='space-y-1'>
                                            <CardTitle className='text-lg'>
                                                {c.title}
                                            </CardTitle>
                                            <p className='text-sm text-muted-foreground'>
                                                /courses/{c.slug}
                                                {c.subtitle
                                                    ? ` • ${c.subtitle}`
                                                    : ""}
                                            </p>
                                            <div className='mt-2 flex flex-wrap gap-2'>
                                                {c.is_published ? (
                                                    <Badge className='text-primary bg-green-400'>
                                                        Published
                                                    </Badge>
                                                ) : (
                                                    <Badge className='text-primary bg-yellow-300'>
                                                        Draft
                                                    </Badge>
                                                )}
                                                {c.created_at ? (
                                                    <span className='text-xs'>
                                                        {"Created"}{" "}
                                                        {new Date(
                                                            c.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className='flex flex-col gap-2 sm:flex-row'>
                                            <Button
                                                asChild
                                                variant='outline'>
                                                <Link
                                                    href={`/admin/courses/${c.id}`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button asChild>
                                                <Link
                                                    href={`/admin/courses/${c.id}/lessons`}>
                                                    Lessons
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent className='text-sm text-muted-foreground'>
                                        <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
                                            <span>
                                                <span className='font-medium text-foreground'>
                                                    Slug:
                                                </span>{" "}
                                                <span className='font-mono'>
                                                    {c.slug}
                                                </span>
                                            </span>
                                            <span>
                                                <span className='font-medium text-foreground'>
                                                    Cover:
                                                </span>{" "}
                                                {c.cover_image_url
                                                    ? "set"
                                                    : "not set"}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </FadeIn>
            </div>
        </div>
    );
}
