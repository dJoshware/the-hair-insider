import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
    title: "About | The Hair Insider",
    description:
        "The Hair Insider is an education-first hair care course library focused on simple routines, clear guidance, and practical decisions.",
};

export default function AboutPage() {
    return <AboutClient />;
}
