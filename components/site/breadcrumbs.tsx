"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
    courses: "Courses",
    library: "Library",
    admin: "Admin",
    signin: "Sign in",
};

function pretty(seg: string) {
    if (!seg) return "";
    const decoded = decodeURIComponent(seg);
    return LABELS[decoded] ?? decoded.replace(/-/g, " ");
}

export function SiteBreadcrumbs({ className = "" }: { className?: string }) {
    const pathname = usePathname();
    const parts = (pathname || "/")
        .split("?")[0]
        .split("#")[0]
        .split("/")
        .filter(Boolean);

    // Optional: hide on home page
    if (parts.length === 0) return null;

    return (
        <div className={`mx-auto max-w-6xl px-6 pt-6 ${className}`}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href='/'>Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    {parts.map((seg, idx) => {
                        const href = "/" + parts.slice(0, idx + 1).join("/");
                        const isLast = idx === parts.length - 1;
                        const label = pretty(seg);

                        return (
                            <React.Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className='capitalize'>
                                            {label}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link
                                                href={href}
                                                className='capitalize'>
                                                {label}
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
