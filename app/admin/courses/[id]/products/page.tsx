import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
    title: "Course Products",
    description: "Manage product links for a course and its lessons.",
    robots: { index: false, follow: false },
};

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ProductsClient id={id} />;
}
