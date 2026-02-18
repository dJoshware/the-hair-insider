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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

type Course = {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    stripe_price_id: string | null;
    is_published: boolean;
};

export default function EditCourseClient({ id }: { id: string }) {
    const { ready } = useAdminGuard();

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const [ok, setOk] = React.useState<string | null>(null);

    const [course, setCourse] = React.useState<Course | null>(null);

    const [title, setTitle] = React.useState("");
    const [slug, setSlug] = React.useState("");
    const [subtitle, setSubtitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [coverImageUrl, setCoverImageUrl] = React.useState("");
    const [stripePriceId, setStripePriceId] = React.useState("");
    const [isPublished, setIsPublished] = React.useState(false);

    React.useEffect(() => {
        if (!ready) return;
        if (!id) return;

        (async () => {
            setErr(null);
            setOk(null);
            setLoading(true);

            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) return; // guard should've redirected already

            const res = await fetch(`/api/admin/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = (await res.json()) as {
                course?: Course;
                error?: string;
            };

            if (!res.ok || !json.course) {
                setErr(json.error || "Course not found.");
                setLoading(false);
                return;
            }

            const c = json.course;
            setCourse(c);

            setTitle(c.title ?? "");
            setSlug(c.slug ?? "");
            setSubtitle(c.subtitle ?? "");
            setDescription(c.description ?? "");
            setCoverImageUrl(c.cover_image_url ?? "");
            setStripePriceId(c.stripe_price_id ?? "");
            setIsPublished(Boolean(c.is_published));

            setLoading(false);
        })();
    }, [ready, id]);

    async function onSave() {
        if (!id) return;
        setErr(null);
        setOk(null);
        setSaving(true);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
            router.replace(
                `/signin?next=${encodeURIComponent(`/admin/courses/${id}`)}`,
            );
            return;
        }

        const res = await fetch(`/api/admin/courses/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: title.trim(),
                slug: slug.trim(),
                subtitle: subtitle.trim() || null,
                description: description.trim() || null,
                cover_image_url: coverImageUrl.trim() || null,
                stripe_price_id: stripePriceId.trim() || null,
                is_published: isPublished,
            }),
        });

        const json = (await res.json()) as { course?: Course; error?: string };

        if (!res.ok) {
            setErr(json.error || "Failed to save.");
            setSaving(false);
            return;
        }

        setCourse(json.course ?? null);
        setOk("Saved.");
        setSaving(false);
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    if (loading) {
        return (
            <div className='mx-auto max-w-4xl px-6 py-14'>
                <p className='text-sm'>Loading…</p>
            </div>
        );
    }

    if (err && !course) {
        return (
            <div className='mx-auto max-w-4xl px-6 py-14'>
                <Card className='rounded-3xl'>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            Couldn’t open course
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='text-sm text-muted-foreground'>
                        {err}
                        <div className='mt-4'>
                            <Button
                                asChild
                                variant='outline'>
                                <Link href='/admin/courses'>
                                    Back to admin courses
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
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
                className='mx-auto max-w-4xl px-6 pt-8'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <Badge variant='secondary'>Admin</Badge>
                            </div>
                            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>
                                {course?.title ?? "Edit course"}
                            </h1>
                            <p className='mt-2'>
                                Update details, pricing, and publish status.
                            </p>
                        </div>

                        <div className='flex gap-3'>
                            <Button asChild>
                                <Link href={`/admin/courses/${id}/lessons`}>
                                    Lessons
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Separator className='my-8' />

                    <Card className='rounded-3xl mb-6'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Course details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {err ? (
                                <p className='text-sm text-destructive'>
                                    {err}
                                </p>
                            ) : null}
                            {ok ? (
                                <p className='text-sm text-emerald-600'>{ok}</p>
                            ) : null}

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='title'>Title</Label>
                                    <Input
                                        id='title'
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='slug'>Slug</Label>
                                    <Input
                                        id='slug'
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                    />
                                    <p className='text-xs text-muted-foreground'>
                                        Used in /courses/{slug || "your-slug"}
                                    </p>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='subtitle'>Subtitle</Label>
                                <Input
                                    id='subtitle'
                                    value={subtitle}
                                    onChange={e => setSubtitle(e.target.value)}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='description'>Description</Label>
                                <Textarea
                                    id='description'
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                    rows={5}
                                />
                            </div>

                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='cover'>
                                        Cover image URL
                                    </Label>
                                    <Input
                                        id='cover'
                                        value={coverImageUrl}
                                        onChange={e =>
                                            setCoverImageUrl(e.target.value)
                                        }
                                    />
                                    <p className='text-xs text-muted-foreground'>
                                        For MVP, paste the Supabase public URL
                                        here.
                                    </p>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='stripe'>
                                        Stripe Price ID
                                    </Label>
                                    <Input
                                        id='stripe'
                                        value={stripePriceId}
                                        onChange={e =>
                                            setStripePriceId(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className='flex items-center justify-between rounded-2xl border p-4'>
                                <div>
                                    <p className='text-sm font-medium'>
                                        Published
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        If off, this course won’t show publicly.
                                    </p>
                                </div>
                                <Switch
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                />
                            </div>

                            <div className='flex items-center justify-end gap-3'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() =>
                                        router.push(
                                            `/courses/${course?.slug ?? ""}`,
                                        )
                                    }
                                    disabled={!course?.slug}>
                                    View public page
                                </Button>
                                <Button
                                    type='button'
                                    onClick={onSave}
                                    disabled={
                                        saving || !title.trim() || !slug.trim()
                                    }>
                                    {saving ? "Saving…" : "Save changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </div>
    );
}
