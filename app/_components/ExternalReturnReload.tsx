"use client";

import * as React from "react";

/**
 * Google app / in-app browsers sometimes resume the page in a broken hydration state
 * after opening external links in a Custom Tab.
 *
 * Strategy:
 * - When user clicks an external link (target=_blank or external origin), set a session flag.
 * - When app regains focus, if flag is set, hard reload.
 *
 * This avoids relying on BFCache / visibility signals that may not fire.
 */
export default function ExternalReturnReload() {
    React.useEffect(() => {
        const FLAG = "thi:external-return-reload";

        const markExternal = () => {
            try {
                sessionStorage.setItem(FLAG, "1");
            } catch {}
        };

        const isExternalHref = (href: string) => {
            try {
                const url = new URL(href, window.location.href);
                return url.origin !== window.location.origin;
            } catch {
                return false;
            }
        };

        // Capture clicks on links, even if nested elements are clicked
        const onClickCapture = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            const a = target?.closest?.("a") as HTMLAnchorElement | null;
            if (!a) return;

            const href = a.getAttribute("href") || "";
            if (!href) return;

            // Your external links are target=_blank, but this also covers absolute external links without it
            const opensNewTab = a.target === "_blank";
            const external = isExternalHref(href);

            if (opensNewTab || external) {
                markExternal();
            }
        };

        const shouldReloadNow = () => {
            try {
                return sessionStorage.getItem(FLAG) === "1";
            } catch {
                return false;
            }
        };

        const clearFlag = () => {
            try {
                sessionStorage.removeItem(FLAG);
            } catch {}
        };

        const reload = () => {
            clearFlag();
            window.location.replace(window.location.href);
        };

        // Focus is the most reliable “I’m back” signal for Custom Tabs
        const onFocus = () => {
            if (shouldReloadNow()) reload();
        };

        // Backup signals (some devices fire one but not the other)
        const onVisibility = () => {
            if (document.visibilityState === "visible" && shouldReloadNow())
                reload();
        };

        document.addEventListener("click", onClickCapture, true);
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            document.removeEventListener("click", onClickCapture, true);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    return null;
}
