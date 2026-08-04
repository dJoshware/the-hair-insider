"use client";

import Link from "next/link";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";

const ADMIN_SECTIONS = [
    {
        title: "Courses",
        href: "/admin/courses",
        description: "Create, edit, publish, and manage lessons.",
        badge: null,
    },
    {
        title: "Products",
        href: "/admin/products",
        description: "Manage the ShopMy product catalog and links.",
        badge: null,
    },
];

export default function AdminClient() {
    const { ready } = useAdminGuard();

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    if (!ready) return null;

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <div
                ref={pageRef}
                className='mx-auto max-w-4xl px-6 pt-10 pb-16'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='flex items-center gap-3 mb-1'>
                        <Badge variant='secondary'>Admin</Badge>
                    </div>
                    <h1 className='text-3xl font-semibold tracking-tight mt-3 mb-10'>
                        Dashboard
                    </h1>

                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {ADMIN_SECTIONS.map(section => (
                            <Link
                                key={section.href}
                                href={section.href}>
                                <Card className='rounded-3xl h-full transition-colors hover:border-foreground/30 cursor-pointer'>
                                    <CardHeader className='pb-2'>
                                        <div className='flex items-center justify-between'>
                                            <CardTitle className='text-base'>
                                                {section.title}
                                            </CardTitle>
                                            {section.badge && (
                                                <Badge
                                                    variant='secondary'
                                                    className='text-xs'>
                                                    {section.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className='text-sm'>
                                            {section.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
