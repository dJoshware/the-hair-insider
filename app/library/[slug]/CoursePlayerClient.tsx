"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { ExternalLink, Download } from "lucide-react";

type Course = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
};

type Module = {
    id: string;
    title: string;
    order: number;
};

type Lesson = {
    id: string;
    module_id: string;
    title: string;
    order: number;
    video_url: string;
};

type ProductLink = {
    id: string;
    title: string;
    url: string;
    lesson_id: string | null;
    sort_order: number | null;
};

type ResourceLink = {
    id: string;
    title: string;
    url: string | null; // cited link
    storage_path: string | null; // pdf in bucket
    lesson_id: string | null;
    sort_order: number | null;
};

export default function CoursePlayerClient({ slug }: { slug: string }) {
    const router = useRouter();

    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);

    const [course, setCourse] = React.useState<Course | null>(null);
    const [modules, setModules] = React.useState<Module[]>([]);
    const [lessons, setLessons] = React.useState<Lesson[]>([]);
    const [activeLessonId, setActiveLessonId] = React.useState<string | null>(
        null,
    );
    const [products, setProducts] = React.useState<ProductLink[]>([]);
    const [resources, setResources] = React.useState<ResourceLink[]>([]);
    const [linksLoading, setLinksLoading] = React.useState(false);

    // Derived: active lesson object
    const activeLesson = React.useMemo(() => {
        if (!activeLessonId) return null;
        return lessons.find(l => l.id === activeLessonId) ?? null;
    }, [activeLessonId, lessons]);

    const visibleProducts = React.useMemo(() => {
        if (!activeLessonId) return products.filter(p => !p.lesson_id);
        return products.filter(
            p => !p.lesson_id || p.lesson_id === activeLessonId,
        );
    }, [products, activeLessonId]);

    const visibleResources = React.useMemo(() => {
        if (!activeLessonId) return resources.filter(r => !r.lesson_id);
        return resources.filter(
            r => !r.lesson_id || r.lesson_id === activeLessonId,
        );
    }, [resources, activeLessonId]);

    React.useEffect(() => {
        const run = async () => {
            setErr(null);
            setLoading(true);

            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                router.replace(
                    `/signin?next=${encodeURIComponent(`/library/${slug}`)}`,
                );
                return;
            }

            // 1) Fetch course (published)
            const { data: courseData, error: courseErr } = await supabase
                .from("courses")
                .select("id, slug, title, subtitle")
                .eq("slug", slug)
                .eq("is_published", true)
                .maybeSingle();

            if (courseErr || !courseData) {
                setErr("Course not found.");
                setLoading(false);
                return;
            }

            // 2) Confirm entitlement (avoid confusing RLS blank state)
            const { data: ent, error: entErr } = await supabase
                .from("entitlements")
                .select("id, status")
                .eq("course_id", courseData.id)
                .eq("status", "active")
                .maybeSingle();

            if (entErr) {
                setErr(entErr.message);
                setLoading(false);
                return;
            }

            if (!ent) {
                setErr("You don’t have access to this course yet.");
                setCourse(courseData);
                setLoading(false);
                return;
            }

            setCourse(courseData);

            // 3) Fetch modules (RLS protected)
            const { data: modulesData, error: modErr } = await supabase
                .from("modules")
                .select("id, title, order")
                .eq("course_id", courseData.id)
                .eq("is_published", true)
                .order("order", { ascending: true });

            if (modErr) {
                setErr(modErr.message);
                setLoading(false);
                return;
            }

            const mods = (modulesData ?? []) as Module[];
            setModules(mods);

            // 4) Fetch lessons for those modules (RLS protected)
            const moduleIds = mods.map(m => m.id);
            if (moduleIds.length === 0) {
                setLessons([]);
                setActiveLessonId(null);
                setLoading(false);
                return;
            }

            const { data: lessonsData, error: lesErr } = await supabase
                .from("lessons")
                .select("id, module_id, title, order, video_url")
                .in("module_id", moduleIds)
                .eq("is_published", true)
                .order("order", { ascending: true });

            if (lesErr) {
                setErr(lesErr.message);
                setLoading(false);
                return;
            }

            const les = (lessonsData ?? []) as Lesson[];
            setLessons(les);

            // 5) Default active lesson = first lesson
            if (les.length > 0) setActiveLessonId(les[0].id);

            setLoading(false);
        };

        if (slug) run();
    }, [router, slug]);

    React.useEffect(() => {
        if (!course?.id) return;

        let cancelled = false;

        (async () => {
            setLinksLoading(true);

            const [prodRes, resRes] = await Promise.all([
                supabase
                    .from("course_products")
                    .select("id, title, url, lesson_id, sort_order")
                    .eq("course_id", course.id)
                    .order("sort_order", { ascending: true }),
                supabase
                    .from("course_resources")
                    .select(
                        "id, title, url, storage_path, lesson_id, sort_order",
                    )
                    .eq("course_id", course.id)
                    .order("sort_order", { ascending: true }),
            ]);

            if (cancelled) return;

            if (!prodRes.error)
                setProducts((prodRes.data ?? []) as ProductLink[]);
            if (!resRes.error)
                setResources((resRes.data ?? []) as ResourceLink[]);

            setLinksLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [course?.id]);

    function lessonsForModule(moduleId: string) {
        return lessons
            .filter(l => l.module_id === moduleId)
            .sort((a, b) => a.order - b.order);
    }

    function normalizeEmbed(url: string) {
        // For Vimeo player links, this is usually already embeddable:
        // https://player.vimeo.com/video/12345
        // If you stored https://vimeo.com/12345, you can convert it here.
        if (url.includes("player.vimeo.com")) return url;

        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch?.[1])
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

        return url;
    }

    async function resolveStorageUrl(
        storagePath: string,
    ): Promise<string | null> {
        const BUCKET = "hair-insider-bucket";

        const { data } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(storagePath);
        return data?.publicUrl ?? null;
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    if (loading) {
        return (
            <div className='mx-auto max-w-6xl px-6 py-14'>
                <p className='text-sm'>Loading course…</p>
            </div>
        );
    }

    if (err) {
        return (
            <div className='mx-auto max-w-6xl px-6 py-14'>
                <div className='flex items-center justify-between gap-4'>
                    <h1 className='text-2xl font-semibold tracking-tight'>
                        Course
                    </h1>
                    <Button
                        asChild
                        variant='outline'>
                        <Link href='/library'>Back to my library</Link>
                    </Button>
                </div>

                <Card className='mt-6 rounded-3xl'>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            Can’t open this course
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='text-sm text-muted-foreground'>
                        {err}
                        <div className='mt-4 flex gap-3'>
                            <Button asChild>
                                <Link href='/courses'>View courses</Link>
                            </Button>
                            <Button
                                asChild
                                variant='outline'>
                                <Link href='/library'>Library</Link>
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
                className='mx-auto max-w-7xl px-4 sm:px-6 pt-8'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <Badge variant='secondary'>Library</Badge>
                            </div>
                            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>
                                {course?.title}
                            </h1>
                            {course?.subtitle ? (
                                <p className='mt-2'>{course.subtitle}</p>
                            ) : null}
                        </div>
                    </div>

                    <Separator className='my-8' />

                    <div className='grid gap-6 lg:grid-cols-[320px_1fr] mb-6'>
                        {/* Left: modules + lessons */}
                        <Card className='rounded-3xl'>
                            <CardHeader className='flex-row items-center justify-between space-y-0'>
                                <CardTitle className='text-base'>
                                    Lessons
                                </CardTitle>
                                <Badge variant='secondary'>
                                    {lessons.length}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <Accordion
                                    type='multiple'
                                    defaultValue={modules
                                        .slice(0, 1)
                                        .map(m => m.id)}>
                                    {modules.map(m => (
                                        <AccordionItem
                                            key={m.id}
                                            value={m.id}>
                                            <AccordionTrigger className='text-sm'>
                                                {m.title}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className='flex flex-col gap-2'>
                                                    {lessonsForModule(m.id).map(
                                                        l => {
                                                            const isActive =
                                                                l.id ===
                                                                activeLessonId;
                                                            return (
                                                                <button
                                                                    key={l.id}
                                                                    onClick={() =>
                                                                        setActiveLessonId(
                                                                            l.id,
                                                                        )
                                                                    }
                                                                    className={[
                                                                        "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                                                                        isActive
                                                                            ? "bg-muted text-foreground"
                                                                            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                                                                    ].join(
                                                                        " ",
                                                                    )}>
                                                                    {l.title}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Right: player */}
                        <div className='space-y-4'>
                            <Card className='overflow-hidden rounded-3xl'>
                                <div className='px-4'>
                                    <p className='text-xs font-medium text-muted-foreground'>
                                        Now playing
                                    </p>
                                    <h2 className='mt-1 text-base font-semibold'>
                                        {activeLesson
                                            ? activeLesson.title
                                            : "Select a lesson"}
                                    </h2>
                                </div>

                                {activeLesson ? (
                                    <div className='relative aspect-video w-full'>
                                        <iframe
                                            src={normalizeEmbed(
                                                activeLesson.video_url,
                                            )}
                                            className='absolute inset-0 h-full w-full'
                                            allow='autoplay; fullscreen; picture-in-picture'
                                            allowFullScreen
                                            title={activeLesson.title}
                                        />
                                    </div>
                                ) : (
                                    <div className='flex aspect-video items-center justify-center bg-muted'>
                                        <p className='text-sm text-muted-foreground'>
                                            Choose a lesson to begin.
                                        </p>
                                    </div>
                                )}
                            </Card>

                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Up next
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='text-sm text-muted-foreground'>
                                    {activeLesson ? (
                                        (() => {
                                            const currentIndex =
                                                lessons.findIndex(
                                                    l =>
                                                        l.id ===
                                                        activeLesson.id,
                                                );
                                            const next =
                                                currentIndex >= 0
                                                    ? lessons[currentIndex + 1]
                                                    : null;
                                            return next ? (
                                                <div className='flex items-center justify-between gap-3'>
                                                    <div>
                                                        <p className='text-foreground font-medium'>
                                                            {next.title}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            setActiveLessonId(
                                                                next.id,
                                                            )
                                                        }>
                                                        Play next
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p>
                                                    You’re at the end of the
                                                    course.
                                                </p>
                                            );
                                        })()
                                    ) : (
                                        <p>
                                            Select a lesson to see what’s next.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className='rounded-3xl'>
                                <CardContent>
                                    <Tabs
                                        defaultValue='products'
                                        className='w-full'>
                                        <TabsList className='grid w-full grid-cols-2'>
                                            <TabsTrigger value='products'>
                                                Products
                                            </TabsTrigger>
                                            <TabsTrigger value='resources'>
                                                Resources
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent
                                            value='products'
                                            className='mt-4'>
                                            {linksLoading ? (
                                                <p className='text-sm text-muted-foreground'>
                                                    Loading…
                                                </p>
                                            ) : (activeLessonId
                                                  ? visibleProducts
                                                  : products
                                              ).length === 0 ? (
                                                <p className='text-sm text-muted-foreground'>
                                                    No product links yet for
                                                    this course.
                                                </p>
                                            ) : (
                                                <div className='space-y-2'>
                                                    {(activeLessonId
                                                        ? visibleProducts
                                                        : products
                                                    ).map(p => (
                                                        <a
                                                            key={p.id}
                                                            href={p.url}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            className='flex items-center justify-between rounded-2xl border px-4 py-3 text-sm hover:bg-muted/40'>
                                                            <span className='font-medium text-foreground'>
                                                                {p.title}
                                                            </span>
                                                            <span className='text-muted-foreground'>
                                                                Open →
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                            <p className='mt-3 text-xs text-muted-foreground'>
                                                Product links open in a new tab.
                                            </p>
                                        </TabsContent>

                                        <TabsContent
                                            value='resources'
                                            className='mt-4'>
                                            {linksLoading ? (
                                                <p className='text-sm text-muted-foreground'>
                                                    Loading…
                                                </p>
                                            ) : (activeLessonId
                                                  ? visibleResources
                                                  : resources
                                              ).length === 0 ? (
                                                <p className='text-sm text-muted-foreground'>
                                                    No resources yet for this
                                                    course.
                                                </p>
                                            ) : (
                                                <div className='space-y-2'>
                                                    {(activeLessonId
                                                        ? visibleResources
                                                        : resources
                                                    ).map(r => (
                                                        <ResourceRow
                                                            key={r.id}
                                                            title={r.title}
                                                            url={r.url}
                                                            storagePath={
                                                                r.storage_path
                                                            }
                                                            onResolveStorageUrl={
                                                                resolveStorageUrl
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <p className='mt-3 text-xs text-muted-foreground'>
                                                Resources include cited sources
                                                and downloadable PDFs.
                                            </p>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}

function ResourceRow({
    title,
    url,
    storagePath,
    onResolveStorageUrl,
}: {
    title: string;
    url: string | null;
    storagePath: string | null;
    onResolveStorageUrl: (path: string) => Promise<string | null>;
}) {
    const [downloading, setDownloading] = React.useState(false);

    async function onDownload() {
        if (!storagePath) return;
        setDownloading(true);
        try {
            const resolved = await onResolveStorageUrl(storagePath);
            if (resolved) window.open(resolved, "_blank", "noreferrer");
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div className='flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm'>
            <div className='min-w-0'>
                <p className='truncate font-medium text-foreground'>{title}</p>
                {url ? (
                    <p className='text-xs text-muted-foreground'>
                        External Link
                    </p>
                ) : null}
            </div>

            <div className='shrink-0 flex gap-2'>
                {url ? (
                    <Button
                        asChild
                        variant='outline'
                        size='sm'>
                        <a
                            href={url}
                            target='_blank'
                            rel='noreferrer'>
                            Open
                        </a>
                    </Button>
                ) : null}

                {storagePath ? (
                    <Button
                        variant='secondary'
                        size='sm'
                        onClick={onDownload}
                        disabled={downloading}>
                        {downloading ? "Loading…" : "Download"}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
