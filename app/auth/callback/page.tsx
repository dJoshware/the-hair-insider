import type { Metadata } from "next";
import CallbackClient from "./CallbackClient";

export const metadata: Metadata = {
    title: "Signing you in",
    description: "Completing secure sign-in for The Hair Insider.",
    robots: { index: false, follow: false },
};

export default function CallbackPage() {
    return <CallbackClient />;
}
