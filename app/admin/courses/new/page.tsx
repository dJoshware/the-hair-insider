import type { Metadata } from "next";
import NewCourseClient from "./NewCourseClient";

export const metadata: Metadata = {
    title: "New Course",
    description: "Create a new course in The Hair Insider admin.",
    robots: { index: false, follow: false },
};

export default function NewCoursePage() {
    return <NewCourseClient />;
}
