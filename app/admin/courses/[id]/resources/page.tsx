import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";

export const metadata: Metadata = {
    title: "Course Resources",
    description: "Manage resources and downloads for a course and its lessons.",
    robots: { index: false, follow: false },
};

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ResourcesClient id={id} />;
}
