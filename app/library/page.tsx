import type { Metadata } from "next";
import LibraryClient from "./LibraryClient";

export const metadata: Metadata = {
    title: "Library",
    description:
        "Access your purchased courses and lessons in The Hair Insider library.",
    robots: { index: false, follow: false },
};

export default function LibraryPage() {
    return <LibraryClient />;
}
