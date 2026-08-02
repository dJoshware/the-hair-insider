import type { Metadata } from "next";
import WelcomeSequenceClient from "./WelcomeSequenceClient";

export const metadata: Metadata = {
    title: "Welcome Sequence",
    description: "Test and monitor the 7-day welcome email sequence.",
    robots: { index: false, follow: false },
};

export default function WelcomeSequencePage() {
    return <WelcomeSequenceClient />;
}
