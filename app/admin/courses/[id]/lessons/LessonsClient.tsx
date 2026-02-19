"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";

type LessonDraft = {
    id?: string;
    title: string;
    order: number;
    video_url: string;
    is_published: boolean;
};

function makeTemplateLessons(): LessonDraft[] {
    return [
        { title: "Lesson 1", order: 1, video_url: "", is_published: true },
        { title: "Lesson 2", order: 2, video_url: "", is_published: true },
        { title: "Lesson 3", order: 3, video_url: "", is_published: true },
    ];
}

export default function LessonsClient({ id }: { id: string }) {
    const router = useRouter();
    const { ready } = useAdminGuard();
    const search = useSearchParams();

    const courseId = String(id);
    const moduleId = String(search.get("module") || "");

    const [items, setItems] = React.useState<LessonDraft[]>(
        makeTemplateLessons(),
    );
    const [loadingExisting, setLoadingExisting] = React.useState(false);

    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    // If no moduleId, keep existing logic that fetches first module and redirects
    React.useEffect(() => {
        if (!ready) return;
        if (moduleId) return;

        let cancelled = false;

        (async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const token = data.session?.access_token;
                if (!token) return;

                const res = await fetch(
                    `/api/admin/courses/${courseId}/modules`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                const json = await res.json();
                if (!res.ok)
                    throw new Error(json.error || "Failed to load modules.");

                const first = json.modules?.[0];
                if (!first?.id) return;

                if (!cancelled) {
                    router.replace(
                        `/admin/courses/${courseId}/lessons?module=${encodeURIComponent(first.id)}`,
                    );
                }
            } catch (e) {
                if (!cancelled) {
                    setError(
                        e instanceof Error
                            ? e.message
                            : "Failed to load modules.",
                    );
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [ready, moduleId, courseId, router]);

    // When moduleId exists, fetch existing lessons and prefill
    React.useEffect(() => {
        if (!ready) return;
        if (!moduleId) return;

        let cancelled = false;

        (async () => {
            setError(null);
            setSuccess(null);
            setLoadingExisting(true);

            try {
                const { data } = await supabase.auth.getSession();
                const token = data.session?.access_token;
                if (!token) return;

                // You’ll add this GET handler (see section 2)
                const res = await fetch(
                    `/api/admin/courses/${courseId}/lessons?module=${encodeURIComponent(moduleId)}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );

                const json = await res.json();
                if (!res.ok)
                    throw new Error(json.error || "Failed to load lessons.");

                const lessons = (json.lessons ?? []) as LessonDraft[];

                if (cancelled) return;

                if (lessons.length > 0) {
                    // Ensure sorted by order
                    const sorted = [...lessons].sort(
                        (a, b) => a.order - b.order,
                    );
                    setItems(sorted);
                } else {
                    // No existing lessons: use 3 templates
                    setItems(makeTemplateLessons());
                }
            } catch (e) {
                if (!cancelled)
                    setError(e instanceof Error ? e.message : "Failed.");
            } finally {
                if (!cancelled) setLoadingExisting(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [ready, moduleId, courseId]);

    function addLesson() {
        setItems(prev => {
            const nextOrder = prev.length
                ? Math.max(...prev.map(x => x.order)) + 1
                : 1;
            return [
                ...prev,
                {
                    title: `Lesson ${prev.length + 1}`,
                    order: nextOrder,
                    video_url: "",
                    is_published: true,
                },
            ];
        });
    }

    function deleteLesson(index: number) {
        setItems(prev => {
            const next = prev.filter((_, i) => i !== index);
            // Optional: renumber orders to stay clean
            return next.map((l, idx) => ({ ...l, order: idx + 1 }));
        });
    }

    function updateLesson(index: number, patch: Partial<LessonDraft>) {
        setItems(prev =>
            prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
        );
    }

    async function save() {
        setError(null);
        setSuccess(null);
        setBusy(true);

        try {
            if (!moduleId) throw new Error("Missing module id.");

            // Only send fully filled lessons (title + video_url)
            const cleaned = items
                .map(l => ({
                    ...l,
                    title: l.title.trim(),
                    video_url: l.video_url.trim(),
                }))
                .filter(l => l.title.length > 0 && l.video_url.length > 0)
                .map((l, idx) => ({
                    ...l,
                    order: idx + 1, // normalize order on save
                }));

            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) {
                router.replace(
                    `/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
                );
                return;
            }

            const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    module_id: moduleId,
                    lessons: cleaned,
                }),
            });

            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "Failed to save lessons.");

            setSuccess("Saved. Your lessons are updated.");

            // If server returns the canonical list, hydrate UI with it:
            if (Array.isArray(json.lessons)) {
                setItems(
                    (json.lessons as LessonDraft[]).sort(
                        (a, b) => a.order - b.order,
                    ),
                );
            }
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
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <div
                ref={pageRef}
                className='mx-auto max-w-4xl px-6 pt-8 space-y-6'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <Card className='rounded-3xl mb-6'>
                        <CardHeader className='flex flex-row justify-between items-center'>
                            <CardTitle>
                                Add lessons (paste Vimeo links)
                            </CardTitle>
                        </CardHeader>

                        <CardContent className='space-y-4'>
                            {error ? (
                                <p className='text-sm text-destructive'>
                                    {error}
                                </p>
                            ) : null}
                            {success ? (
                                <p className='text-sm text-emerald-600'>
                                    {success}
                                </p>
                            ) : null}

                            {!moduleId ? (
                                <p className='text-sm text-destructive'>
                                    Missing module id. Add ?module=... or go
                                    back and open Lessons again.
                                </p>
                            ) : null}

                            {loadingExisting ? (
                                <p className='text-sm text-muted-foreground'>
                                    Loading existing lessons…
                                </p>
                            ) : null}

                            <div className='grid gap-4'>
                                {items.map((l, idx) => (
                                    <div
                                        key={l.id ?? idx}
                                        className='rounded-2xl border p-4 space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <p className='text-sm font-medium'>
                                                Lesson
                                            </p>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                onClick={() =>
                                                    deleteLesson(idx)
                                                }
                                                aria-label='Delete lesson'>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>

                                        <div className='grid gap-3 sm:grid-cols-[100px_1fr]'>
                                            <div className='space-y-2'>
                                                <Label>Order</Label>
                                                <Input
                                                    type='number'
                                                    value={l.order}
                                                    onChange={e =>
                                                        updateLesson(idx, {
                                                            order: Number(
                                                                e.target
                                                                    .value || 1,
                                                            ),
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Title</Label>
                                                <Input
                                                    value={l.title}
                                                    onChange={e =>
                                                        updateLesson(idx, {
                                                            title: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className='space-y-2'>
                                            <Label>Vimeo link</Label>
                                            <Input
                                                value={l.video_url}
                                                onChange={e =>
                                                    updateLesson(idx, {
                                                        video_url:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder='Paste vimeo.com/123 or player.vimeo.com/video/123'
                                            />
                                            <p className='text-xs text-muted-foreground'>
                                                Only lessons with a title +
                                                Vimeo link will be saved.
                                            </p>
                                        </div>

                                        <div className='flex items-center justify-between rounded-xl bg-muted p-3'>
                                            <p className='text-sm font-medium'>
                                                Published
                                            </p>
                                            <Switch
                                                checked={l.is_published}
                                                onCheckedChange={checked =>
                                                    updateLesson(idx, {
                                                        is_published: checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type='button'
                                    variant='outline'
                                    className='h-12 rounded-2xl'
                                    onClick={addLesson}>
                                    <Plus className='h-4 w-4 mr-2' />
                                    Add lesson
                                </Button>
                            </div>

                            <Separator />

                            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                <Button
                                    variant='outline'
                                    onClick={() => router.push("/courses")}>
                                    Preview courses
                                </Button>
                                <Button
                                    className='h-12'
                                    onClick={save}
                                    disabled={busy || !moduleId}>
                                    {busy ? "Saving…" : "Save lessons"}
                                </Button>
                            </div>

                            <p className='text-xs text-muted-foreground'>
                                Removing a lesson card and saving will delete it
                                from this module.
                            </p>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </div>
    );
}
