import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
    title: "Reset Password",
    description: "Request a password reset for your The Hair Insider account.",
    robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordClient />;
}
