import type { Metadata } from "next";
import EditCourseClient from "./EditCourseClient";

export const metadata: Metadata = {
    title: "Edit Course",
    description: "Edit course details in The Hair Insider admin.",
    robots: { index: false, follow: false },
};

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <EditCourseClient id={id} />;
}
