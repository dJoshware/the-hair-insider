import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
    title: "Success",
    description:
        "Your purchase is complete. Access your The Hair Insider content and get started.",
    robots: { index: false, follow: false },
};

export default function SuccessPage() {
    return <SuccessClient />;
}
