"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FadeInProps = {
    children: React.ReactNode;
    inView: boolean;
    className?: string;
    delayMs?: number;
    durationMs?: number;
    y?: number;
};

export function FadeIn({
    children,
    inView,
    className,
    delayMs = 150,
    durationMs = 700,
}: FadeInProps) {
    return (
        <div
            className={cn(
                "transition-all ease-out will-change-transform",
                inView
                    ? "opacity-100 translate-y-0"
                    : `opacity-0 translate-y-3`,
                className,
            )}
            style={{
                transitionDuration: `${durationMs}ms`,
                transitionDelay: `${inView ? delayMs : 0}ms`,
            }}>
            {children}
        </div>
    );
}
