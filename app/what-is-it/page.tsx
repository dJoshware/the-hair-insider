import type { Metadata } from "next";
import WhatIsItClient from "./WhatIsItClient";

export const metadata: Metadata = {
    title: "What Is The Hair Insider? | The Hair Insider",
    description:
        "Learn what The Hair Insider is: an education-first hair care course library focused on the why behind hair health so you can stop guessing and build a routine that works.",
    alternates: {
        canonical: "/what-is-it",
    },
    openGraph: {
        title: "What Is The Hair Insider?",
        description:
            "An education-first hair care course library focused on the why behind hair health so you can stop guessing and build a routine that works.",
        url: "/what-is-it",
        siteName: "The Hair Insider",
        type: "website",
    },
};

export default function Page() {
    return <WhatIsItClient />;
}
