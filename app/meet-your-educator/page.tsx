import type { Metadata } from "next";
import MeetYourEducatorClient from "./MeetYourEducatorClient";

export const metadata: Metadata = {
    title: "Meet Your Educator | The Hair Insider",
    description:
        "Meet Lauren Jackson, licensed cosmetologist and educator behind The Hair Insider. Learn why the course is built around clarity, routines, and practical hair science.",
    alternates: {
        canonical: "/meet-your-educator",
    },
    openGraph: {
        title: "Meet Your Educator",
        description:
            "Meet Lauren Jackson, the educator behind The Hair Insider and the clarity-first approach to hair routines.",
        url: "/meet-your-educator",
        siteName: "The Hair Insider",
        type: "website",
    },
};

export default function Page() {
    return <MeetYourEducatorClient />;
}
