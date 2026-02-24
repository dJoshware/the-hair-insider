import type { Metadata } from "next";
import InsideTheCourseClient from "./InsideTheCourseClient";

export const metadata: Metadata = {
    title: "Inside The Course | The Hair Insider",
    description:
        "See what’s inside The Hair Insider course library: short lessons, downloadable guides, and a simple routine framework designed for real life.",
    alternates: {
        canonical: "/inside-the-course",
    },
    openGraph: {
        title: "Inside The Course",
        description:
            "Short lessons, downloadable guides, and a simple routine framework designed for real life.",
        url: "/inside-the-course",
        siteName: "The Hair Insider",
        type: "website",
    },
};

export default function Page() {
    return <InsideTheCourseClient />;
}
