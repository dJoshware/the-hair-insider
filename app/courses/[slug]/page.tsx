import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";
import { getPublishedCourseBySlug } from "@/lib/data/courses.server";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const course = await getPublishedCourseBySlug(slug);

    if (!course) {
        return {
            title: "Course not found",
            description:
                "This course may be unpublished or the link is incorrect.",
            robots: { index: false, follow: false },
        };
    }

    return {
        title: course.title,
        description:
            course.subtitle ??
            course.description ??
            "A practical, education-first course that helps you stop guessing and build a routine that actually fits your hair.",
    };
}

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const course = await getPublishedCourseBySlug(slug);

    // If you prefer, you can render a not-found UI server-side here too,
    // but keeping it in the client is fine for MVP.
    return (
        <CourseDetailClient
            slug={slug}
            initialCourse={course}
        />
    );
}
