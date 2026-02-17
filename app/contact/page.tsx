import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Have a question about The Hair Insider? Contact us for support, course access help, partnerships, or general inquiries.",
};

export default function ContactPage() {
    return <ContactClient />;
}
