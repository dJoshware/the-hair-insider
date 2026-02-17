import type { Metadata } from "next";
import EditCourseClient from "./EditCourseClient";

export const metadata: Metadata = {
    title: "Edit Course",
    description: "Edit course details in The Hair Insider admin.",
    robots: { index: false, follow: false },
};

export default function EditCoursePage({ params }: { params: { id: string } }) {
    return <EditCourseClient id={params.id}/>;
}
