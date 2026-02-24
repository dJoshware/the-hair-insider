"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export function LibraryTab() {
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
                    `/signin?next=${encodeURIComponent("/account?tab=library")}`,
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

    return (
        <>
            <div className='flex items-end justify-between gap-6'>
                <div>
                    <h2 className='text-2xl font-semibold tracking-tight'>
                        My Courses
                    </h2>
                </div>
            </div>

            <div className='mt-6'>
                {loading ? (
                    <p className='text-sm'>Loading…</p>
                ) : err ? (
                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Couldn’t load your library
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='text-sm'>
                            {err}
                            <div className='mt-4'>
                                <Button
                                    asChild
                                    variant='outline'>
                                    <Link href='/courses'>Browse courses</Link>
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
                        <CardContent className='text-sm'>
                            When you purchase a course, it will appear here.
                            <div className='mt-4'>
                                <Button asChild>
                                    <Link href='/courses'>Browse courses</Link>
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
                                                <p className='text-sm'>
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
        </>
    );
}
