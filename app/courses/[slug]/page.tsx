import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";
import { getPublishedCourseBySlug } from "@/lib/data/courses.server";

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const course = await getPublishedCourseBySlug(params.slug);

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
    params: { slug: string };
}) {
    const course = await getPublishedCourseBySlug(params.slug);

    // If you prefer, you can render a not-found UI server-side here too,
    // but keeping it in the client is fine for MVP.
    return (
        <CourseDetailClient
            slug={params.slug}
            initialCourse={course}
        />
    );
}
