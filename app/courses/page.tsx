import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
    title: "Courses",
    description:
        "Browse The Hair Insider course library. Clear guidance, simple routines, and practical hair decisions based on how hair actually behaves.",
};

export default function CoursesPage() {
    return <CoursesClient />;
}
