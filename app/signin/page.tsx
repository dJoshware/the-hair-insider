import type { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your The Hair Insider account.",
    robots: { index: false, follow: false },
};

export default function SignInPage() {
    return <SignInClient />;
}
