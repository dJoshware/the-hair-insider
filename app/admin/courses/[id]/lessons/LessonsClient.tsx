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

type LessonDraft = {
    id?: string;
    title: string;
    order: number;
    video_url: string;
    is_published: boolean;
};

export default function LessonsClient({ id }: { id: string }) {
    const router = useRouter();
    const { ready } = useAdminGuard();
    const search = useSearchParams();

    const courseId = String(id);
    const moduleId = String(search.get("module") || "");

    const [items, setItems] = React.useState<LessonDraft[]>([
        { title: "Lesson 1", order: 1, video_url: "", is_published: true },
        { title: "Lesson 2", order: 2, video_url: "", is_published: true },
        { title: "Lesson 3", order: 3, video_url: "", is_published: true },
        { title: "Lesson 4", order: 4, video_url: "", is_published: true },
    ]);

    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

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

    async function save() {
        setError(null);
        setSuccess(null);
        setBusy(true);

        try {
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
                    lessons: items,
                }),
            });

            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "Failed to save lessons.");

            setSuccess("Saved. Your lessons are updated.");
            router.replace(
                `/admin/courses/${courseId}/lessons?module=${encodeURIComponent(moduleId)}`,
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
                                    Missing module id. Go back and create the
                                    course again (or add ?module=...).
                                </p>
                            ) : null}

                            <div className='grid gap-4'>
                                {items.map((l, idx) => (
                                    <div
                                        key={idx}
                                        className='rounded-2xl border p-4 space-y-3'>
                                        <div className='grid gap-3 sm:grid-cols-[80px_1fr]'>
                                            <div className='space-y-2'>
                                                <Label>Order</Label>
                                                <Input
                                                    type='number'
                                                    value={l.order}
                                                    onChange={e => {
                                                        const v = Number(
                                                            e.target.value || 1,
                                                        );
                                                        setItems(prev =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          order: v,
                                                                      }
                                                                    : x,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Title</Label>
                                                <Input
                                                    value={l.title}
                                                    onChange={e => {
                                                        const v =
                                                            e.target.value;
                                                        setItems(prev =>
                                                            prev.map((x, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...x,
                                                                          title: v,
                                                                      }
                                                                    : x,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className='space-y-2'>
                                            <Label>Vimeo link</Label>
                                            <Input
                                                value={l.video_url}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    setItems(prev =>
                                                        prev.map((x, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...x,
                                                                      video_url:
                                                                          v,
                                                                  }
                                                                : x,
                                                        ),
                                                    );
                                                }}
                                                placeholder='Paste vimeo.com/123 or player.vimeo.com/video/123'
                                            />
                                            <p className='text-xs text-muted-foreground'>
                                                Paste any Vimeo URL. We’ll store
                                                it as an embeddable link
                                                automatically.
                                            </p>
                                        </div>

                                        <div className='flex items-center justify-between rounded-xl bg-muted p-3'>
                                            <p className='text-sm font-medium'>
                                                Published
                                            </p>
                                            <Switch
                                                checked={l.is_published}
                                                onCheckedChange={checked => {
                                                    setItems(prev =>
                                                        prev.map((x, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...x,
                                                                      is_published:
                                                                          checked,
                                                                  }
                                                                : x,
                                                        ),
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

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
                                After saving, purchase the course (or use your
                                test entitlement) and verify the player loads.
                            </p>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </div>
    );
}
