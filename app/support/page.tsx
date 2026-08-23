import type { Metadata } from "next";
import SupportClient from "./SupportClient";

export const metadata: Metadata = {
    title: "Support",
    description:
        "Have a question about The Hair Insider? Reach our support team for course access help, partnerships, or general inquiries.",
};

export default function SupportPage() {
    return <SupportClient />;
}
