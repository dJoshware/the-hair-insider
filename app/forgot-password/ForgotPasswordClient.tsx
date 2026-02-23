"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ForgotPasswordClient() {
    const [email, setEmail] = React.useState("");
    const [status, setStatus] = React.useState<
        "idle" | "sending" | "success" | "error"
    >("idle");
    const [message, setMessage] = React.useState("");

    const params =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;

    const next = params?.get("next") || "/library";

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (!isValidEmail(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }

        setStatus("sending");

        try {
            try {
                localStorage.setItem("postAuthRedirect", next);
            } catch {}
            const redirectTo = `${window.location.origin}`;
            await supabase.auth.resetPasswordForEmail(email, { redirectTo });

            setStatus("success");
            setMessage("Check your email for a password reset link.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Could not send reset email.");
        }
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main
                ref={pageRef}
                className='mx-auto flex max-w-6xl flex-col items-center px-6 py-14 sm:py-20'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='w-full max-w-md'>
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-2xl'>
                                    Reset your password
                                </CardTitle>
                                <CardDescription>
                                    Enter your email and we’ll send you a secure
                                    reset link.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className='space-y-6'>
                                <form
                                    onSubmit={onSubmit}
                                    className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='email'>Email</Label>
                                        <Input
                                            id='email'
                                            type='email'
                                            autoComplete='email'
                                            placeholder='you@example.com'
                                            value={email}
                                            onChange={e =>
                                                setEmail(e.target.value)
                                            }
                                            disabled={
                                                status === "sending" ||
                                                status === "success"
                                            }
                                        />
                                    </div>

                                    <Button
                                        type='submit'
                                        className='w-full'
                                        disabled={
                                            status === "sending" ||
                                            !isValidEmail(email)
                                        }>
                                        {status === "sending"
                                            ? "Sending…"
                                            : "Send reset link"}
                                    </Button>
                                </form>

                                {status === "success" && (
                                    <Alert className='bg-green-400'>
                                        <AlertTitle>Email sent</AlertTitle>
                                        <AlertDescription className='text-foreground'>
                                            {message} If you don’t see it in a
                                            minute, check spam/promotions.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {status === "error" && (
                                    <Alert className='bg-red-400'>
                                        <AlertTitle>
                                            Couldn’t send email
                                        </AlertTitle>
                                        <AlertDescription className='text-foreground'>
                                            {message}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className='text-sm text-muted-foreground'>
                                    <p className='leading-6'>
                                        Remembered your password?{" "}
                                        <Link
                                            href='/signin'
                                            className='font-medium text-foreground underline underline-offset-4'>
                                            Sign in
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </FadeIn>
            </main>
        </div>
    );
}
