"use client";

import * as React from "react";

/**
 * Some in-app browsers (Google app, Instagram in-app, etc.) restore pages from BFCache
 * in a partially-hydrated state, causing missing UI chunks.
 *
 * This forces a full reload when the page is restored from BFCache (back/forward cache).
 */
export default function BfcacheReload() {
    React.useEffect(() => {
        const onPageShow = (event: PageTransitionEvent) => {
            // event.persisted === true means this page was restored from BFCache
            if (event.persisted) {
                window.location.reload();
                return;
            }

            // Extra guard: some browsers don't set persisted reliably
            // but expose navigation type as "back_forward"
            const navEntries = performance.getEntriesByType(
                "navigation",
            ) as PerformanceNavigationTiming[];
            const navType = navEntries?.[0]?.type;

            if (navType === "back_forward") {
                window.location.reload();
            }
        };

        window.addEventListener("pageshow", onPageShow);

        return () => {
            window.removeEventListener("pageshow", onPageShow);
        };
    }, []);

    return null;
}
