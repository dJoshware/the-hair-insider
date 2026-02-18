import type { Metadata } from "next";
import LessonsClient from "./LessonsClient";

export const metadata: Metadata = {
    title: "Course Lessons",
    description: "Manage lessons for a course in The Hair Insider admin.",
    robots: { index: false, follow: false },
};

export default async function LessonsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <LessonsClient id={id} />;
}
