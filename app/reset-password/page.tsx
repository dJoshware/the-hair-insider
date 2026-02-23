import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
    title: "Choose a New Password",
    description: "Set a new password for your The Hair Insider account.",
    robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordClientFallback />}>
            <ResetPasswordClient />
        </Suspense>
    );
}

function ResetPasswordClientFallback() {
    return (
        <div className='mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6'>
            <p className='text-sm text-muted-foreground'>Loading…</p>
        </div>
    );
}
