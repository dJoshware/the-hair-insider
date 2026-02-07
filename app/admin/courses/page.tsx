// app/admin/courses/page.tsx
"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CourseRow = {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    is_published: boolean;
    cover_image_url: string | null;
    created_at?: string | null;
};

export default function AdminCoursesListPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);
    const [courses, setCourses] = React.useState<CourseRow[]>([]);

    React.useEffect(() => {
        const run = async () => {
            setErr(null);
            setLoading(true);

            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                router.replace(
                    `/signin?next=${encodeURIComponent("/admin/courses")}`,
                );
                return;
            }

            const token = sessionData.session.access_token;

            // Confirm admin
            const meRes = await fetch("/api/admin/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!meRes.ok) {
                router.replace("/library");
                return;
            }

            const meJson = (await meRes.json()) as { isAdmin?: boolean };
            if (!meJson.isAdmin) {
                router.replace("/library");
                return;
            }

            // Fetch courses (server-side bypasses RLS and allows unpublished too)
            const res = await fetch("/api/admin/courses", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = (await res.json()) as {
                courses?: CourseRow[];
                error?: string;
            };
            if (!res.ok) {
                setErr(json.error || "Failed to load courses.");
                setLoading(false);
                return;
            }

            setCourses(json.courses ?? []);
            setLoading(false);
        };

        run();
    }, [router]);

    return (
        <div className='mx-auto max-w-6xl px-6 py-14'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                    <div className='flex items-center gap-3'>
                        <Badge variant='secondary'>Admin</Badge>
                        <Badge variant='outline'>Courses</Badge>
                    </div>
                    <h1 className='mt-3 text-3xl font-semibold tracking-tight'>
                        Manage courses
                    </h1>
                    <p className='mt-2 text-muted-foreground'>
                        Create, edit, publish, and manage lessons.
                    </p>
                </div>

                <div className='flex gap-3'>
                    <Button asChild>
                        <Link href='/admin/courses/new'>New course</Link>
                    </Button>
                    <Button
                        asChild
                        variant='outline'>
                        <Link href='/library'>Library</Link>
                    </Button>
                </div>
            </div>

            <Separator className='my-8' />

            {loading ? (
                <p className='text-sm text-muted-foreground'>Loading…</p>
            ) : err ? (
                <Card className='rounded-3xl'>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            Couldn’t load courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='text-sm text-muted-foreground'>
                        {err}
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
                        Create your first course to start adding lessons.
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
                <div className='grid gap-4'>
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
                                        {c.subtitle ? ` • ${c.subtitle}` : ""}
                                    </p>
                                    <div className='mt-2 flex flex-wrap gap-2'>
                                        {c.is_published ? (
                                            <Badge variant='secondary'>
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge variant='outline'>
                                                Draft
                                            </Badge>
                                        )}
                                        {c.created_at ? (
                                            <span className='text-xs text-muted-foreground'>
                                                Created{" "}
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
                                        <Link href={`/admin/courses/${c.id}`}>
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
                                        {c.cover_image_url ? "set" : "not set"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
