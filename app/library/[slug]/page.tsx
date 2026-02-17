import type { Metadata } from "next";
import CoursePlayerClient from "./CoursePlayerClient";

export const metadata: Metadata = {
    title: "Course Player",
    description: "Watch your Hair Insider course lessons.",
    robots: { index: false, follow: false },
};

export default async function CoursePlayerPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return <CoursePlayerClient slug={slug} />;
}
