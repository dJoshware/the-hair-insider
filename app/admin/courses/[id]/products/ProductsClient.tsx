"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/lib/supabase/client";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";

import { FadeIn } from "@/components/site/FadeIn";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

type ModuleRow = { id: string; title: string; order: number };
type LessonRow = {
    id: string;
    module_id: string;
    title: string;
    order: number;
};

type ProductRow = {
    id?: string;
    title: string;
    url: string;
    sort_order?: number | null;
};

function makeBlankRow(n: number): ProductRow[] {
    return Array.from({ length: n }).map((_, i) => ({
        title: `Item ${i + 1}`,
        url: "",
        sort_order: i + 1,
    }));
}

export default function ProductsClient({ id }: { id: string }) {
    const router = useRouter();
    const { ready } = useAdminGuard();

    const [modules, setModules] = React.useState<ModuleRow[]>([]);
    const [lessons, setLessons] = React.useState<LessonRow[]>([]);
    const [scopeLessonId, setScopeLessonId] = React.useState<string>(""); // "" = course-wide

    const [items, setItems] = React.useState<ProductRow[]>(makeBlankRow(3));
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const [ok, setOk] = React.useState<string | null>(null);

    // Fetch modules + lessons index for dropdown (admin endpoints)
    React.useEffect(() => {
        if (!ready) return;

        let cancelled = false;

        (async () => {
            setErr(null);
            setLoading(true);

            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) return;

            // modules
            const modRes = await fetch(`/api/admin/courses/${id}/modules`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const modJson = await modRes.json();
            if (!modRes.ok) {
                if (!cancelled)
                    setErr(modJson.error || "Failed to load modules.");
                if (!cancelled) setLoading(false);
                return;
            }

            const mods = (modJson.modules ?? []) as ModuleRow[];
            mods.sort((a, b) => a.order - b.order);

            // lessons per module (calls your lessons GET with ?module=)
            const lessonLists: LessonRow[] = [];
            for (const m of mods) {
                const res = await fetch(
                    `/api/admin/courses/${id}/lessons?module=${encodeURIComponent(m.id)}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const json = await res.json();
                if (res.ok && Array.isArray(json.lessons)) {
                    const rows = (json.lessons as any[]).map(l => ({
                        id: String(l.id),
                        module_id: String(l.module_id),
                        title: String(l.title),
                        order: Number(l.order ?? 0),
                    }));
                    lessonLists.push(...rows);
                }
            }

            lessonLists.sort((a, b) => a.order - b.order);

            if (!cancelled) {
                setModules(mods);
                setLessons(lessonLists);
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [ready, id]);

    // Fetch products for current scope
    React.useEffect(() => {
        if (!ready) return;

        let cancelled = false;

        (async () => {
            setErr(null);
            setOk(null);

            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) return;

            setLoading(true);

            const qs = scopeLessonId
                ? `?lesson=${encodeURIComponent(scopeLessonId)}`
                : "";
            const res = await fetch(`/api/admin/courses/${id}/products${qs}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();

            if (cancelled) return;

            if (!res.ok) {
                setErr(json.error || "Failed to load products.");
                setItems(makeBlankRow(3));
                setLoading(false);
                return;
            }

            const rows = (json.products ?? []) as ProductRow[];
            setItems(rows.length ? rows : makeBlankRow(3));
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [ready, id, scopeLessonId]);

    function addRow() {
        setItems(prev => [
            ...prev,
            {
                title: `Item ${prev.length + 1}`,
                url: "",
                sort_order: prev.length + 1,
            },
        ]);
    }

    function removeRow(idx: number) {
        setItems(prev => prev.filter((_, i) => i !== idx));
    }

    function updateRow(idx: number, patch: Partial<ProductRow>) {
        setItems(prev =>
            prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)),
        );
    }

    async function onSave() {
        setErr(null);
        setOk(null);
        setSaving(true);

        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) return;

            // only fully filled
            const cleaned = items
                .map(p => ({
                    title: p.title.trim(),
                    url: p.url.trim(),
                    sort_order: p.sort_order ?? null,
                }))
                .filter(p => p.title && p.url)
                .map((p, idx) => ({
                    ...p,
                    sort_order: p.sort_order ?? idx + 1,
                }));

            const res = await fetch(`/api/admin/courses/${id}/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    lesson_id: scopeLessonId || null,
                    products: cleaned,
                }),
            });

            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "Failed to save products.");

            setItems((json.products ?? []) as ProductRow[]);
            setOk("Saved.");
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Failed.");
        } finally {
            setSaving(false);
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
                className='mx-auto max-w-4xl px-6 pt-8'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex items-end justify-between gap-4'>
                        <div>
                            <h1 className='text-3xl font-semibold tracking-tight'>
                                Products
                            </h1>
                            <p className='mt-2 text-sm'>
                                Add ShopMy links for the whole course or for a
                                specific lesson.
                            </p>
                        </div>

                        <Button
                            asChild
                            variant='secondary'>
                            <Link href='/admin/courses'>
                                Back to course
                            </Link>
                        </Button>
                    </div>

                    <Separator className='my-8' />

                    <Card className='rounded-3xl mb-6'>
                        <CardHeader>
                            <CardTitle className='text-base'>Scope</CardTitle>
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

                            <div className='space-y-2'>
                                <Label>Apply products to</Label>
                                <select
                                    className='h-11 w-full rounded-md border bg-background px-3 text-sm'
                                    value={scopeLessonId}
                                    onChange={e =>
                                        setScopeLessonId(e.target.value)
                                    }
                                    disabled={loading}>
                                    <option value=''>
                                        Course-wide (shown for all lessons)
                                    </option>
                                    {lessons.map(l => (
                                        <option
                                            key={l.id}
                                            value={l.id}>
                                            {l.title}
                                        </option>
                                    ))}
                                </select>
                                <p className='text-xs text-muted-foreground'>
                                    Course-wide products use{" "}
                                    <code>lesson_id = null</code>.
                                </p>
                            </div>

                            <Separator />

                            {loading ? (
                                <p className='text-sm text-muted-foreground'>
                                    Loading…
                                </p>
                            ) : (
                                <div className='space-y-4'>
                                    {items.map((p, idx) => (
                                        <div
                                            key={p.id ?? idx}
                                            className='rounded-2xl border p-4 space-y-3'>
                                            <div className='flex items-center justify-between gap-3'>
                                                <p className='text-sm font-medium'>
                                                    Product link
                                                </p>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() =>
                                                        removeRow(idx)
                                                    }
                                                    aria-label='Remove row'>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>Title</Label>
                                                <Input
                                                    value={p.title}
                                                    onChange={e =>
                                                        updateRow(idx, {
                                                            title: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder='Davines OI Oil'
                                                />
                                            </div>

                                            <div className='space-y-2'>
                                                <Label>ShopMy URL</Label>
                                                <Input
                                                    value={p.url}
                                                    onChange={e =>
                                                        updateRow(idx, {
                                                            url: e.target.value,
                                                        })
                                                    }
                                                    placeholder='https://shopmy.us/collections/...'
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type='button'
                                        variant='outline'
                                        className='h-12 w-full rounded-2xl'
                                        onClick={addRow}>
                                        + Add product
                                    </Button>

                                    <div className='flex justify-end'>
                                        <Button
                                            className='h-12'
                                            onClick={onSave}
                                            disabled={saving}>
                                            {saving
                                                ? "Saving…"
                                                : "Save products"}
                                        </Button>
                                    </div>

                                    <p className='text-xs text-muted-foreground'>
                                        Only rows with a title and a URL are
                                        saved.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </div>
    );
}
