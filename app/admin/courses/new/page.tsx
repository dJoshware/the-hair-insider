"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function AdminNewCoursePage() {
    const router = useRouter();
    const { ready } = useAdminGuard();

    const [title, setTitle] = React.useState("");
    const [slug, setSlug] = React.useState("");
    const [subtitle, setSubtitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [stripePriceId, setStripePriceId] = React.useState("");
    const [isPublished, setIsPublished] = React.useState(false);

    const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function uploadCover(file: File) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `course-covers/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage
            .from("thumbnails")
            .upload(path, file, {
                upsert: true,
                contentType: file.type,
            });

        if (upErr) throw new Error(upErr.message);

        const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
        return data.publicUrl;
    }

    async function onSubmit() {
        setError(null);
        setBusy(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) {
                router.replace(
                    `/signin?next=${encodeURIComponent("/admin/courses/new")}`,
                );
                return;
            }

            const res = await fetch("/api/admin/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    slug: slug || slugify(title),
                    subtitle: subtitle || null,
                    description: description || null,
                    cover_image_url: coverUrl,
                    stripe_price_id: stripePriceId || null,
                    is_published: isPublished,
                }),
            });

            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "Failed to create course.");

            router.push(
                `/admin/courses/${json.course.id}/lessons?module=${json.defaultModuleId}`,
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed.");
        } finally {
            setBusy(false);
        }
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    if (!ready) return null;

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
                className='mx-auto max-w-3xl px-6 pt-8'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <Card className='rounded-3xl mb-6'>
                        <CardHeader>
                            <CardTitle>Create course</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {error ? (
                                <p className='text-sm text-destructive'>
                                    {error}
                                </p>
                            ) : null}

                            <div className='space-y-2'>
                                <Label>Title</Label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder='Mini-Course: The Basics'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Slug</Label>
                                <Input
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder='mini-course-basics'
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Leave blank to auto-generate from title.
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <Label>Subtitle</Label>
                                <Input
                                    value={subtitle}
                                    onChange={e => setSubtitle(e.target.value)}
                                    placeholder='Healthy hair, explained simply.'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder='What this course covers...'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Stripe Price ID</Label>
                                <Input
                                    value={stripePriceId}
                                    onChange={e =>
                                        setStripePriceId(e.target.value)
                                    }
                                    placeholder='price_...'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>Course cover (thumbnail)</Label>
                                <Input
                                    type='file'
                                    accept='image/png,image/jpeg,image/webp'
                                    onChange={async e => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setBusy(true);
                                        setError(null);
                                        try {
                                            const url = await uploadCover(file);
                                            setCoverUrl(url);
                                        } catch (err) {
                                            setError(
                                                err instanceof Error
                                                    ? err.message
                                                    : "Upload failed.",
                                            );
                                        } finally {
                                            setBusy(false);
                                        }
                                    }}
                                />
                                {coverUrl ? (
                                    <p className='text-xs text-muted-foreground'>
                                        Uploaded: {coverUrl}
                                    </p>
                                ) : null}
                            </div>

                            <div className='flex items-center justify-between rounded-2xl border p-4'>
                                <div>
                                    <p className='text-sm font-medium'>
                                        Publish now
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        If off, it stays hidden until you
                                        publish.
                                    </p>
                                </div>
                                <Switch
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                />
                            </div>

                            <Button
                                className='h-12 w-full'
                                onClick={onSubmit}
                                disabled={busy || !title.trim()}>
                                {busy ? "Saving…" : "Create course"}
                            </Button>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </div>
    );
}
