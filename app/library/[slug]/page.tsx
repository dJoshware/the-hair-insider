import type { Metadata } from "next";
import CoursePlayerClient from "./CoursePlayerClient";

export const metadata: Metadata = {
    title: "Course Player",
    description: "Watch your Hair Insider course lessons.",
    robots: { index: false, follow: false },
};

export default function CoursePlayerPage({
    params,
}: {
    params: { slug: string };
}) {
    return <CoursePlayerClient slug={params.slug} />;
}
