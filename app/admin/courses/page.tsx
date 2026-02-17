import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
    title: "Admin Courses",
    description: "Admin course management for The Hair Insider.",
    robots: { index: false, follow: false },
};

export default function AdminCoursesPage() {
    return <CoursesClient />;
}
