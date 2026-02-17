import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
    title: "Privacy Policy | The Hair Insider",
    description:
        "Privacy Policy for The Hair Insider. Learn what we collect, how we use it, and your choices.",
};

export default function PrivacyPage() {
    return <PrivacyClient />;
}
