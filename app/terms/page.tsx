import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
    title: "Terms of Service | The Hair Insider",
    description:
        "Terms of Service for The Hair Insider. Education-only content, acceptable use, payments, and limitations of liability.",
};

export default function TermsPage() {
    return <TermsClient />;
}
