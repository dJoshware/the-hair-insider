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

type Status = "idle" | "sending" | "success" | "error";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SigninPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [status, setStatus] = React.useState<Status>("idle");
    const [message, setMessage] = React.useState("");

    const canSubmit = React.useMemo(
        () => status !== "sending" && isValidEmail(email),
        [email, status],
    );

    async function onSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setMessage("");

        if (!isValidEmail(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }

        setStatus("sending");

        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        if (next) localStorage.setItem("postAuthRedirect", next);

        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback`
                : undefined;

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo,
            },
        });

        if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
        }

        setStatus("success");
        setMessage("Check your email for a secure sign-in link.");
    }

    async function onDevPasswordLogin(e: React.SubmitEvent) {
        e.preventDefault();
        setMessage("");
        setStatus("sending");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
        }

        setStatus("success");
        setMessage("Signed in (dev mode). Redirecting…");

        // Optional redirect
        window.location.href = "/library";
    }

    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            {/* Fixed background and overlay layer */}
            <Overlay />

            {/* Main content */}
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
                                    Sign in
                                </CardTitle>
                                <CardDescription>
                                    Enter your email and we’ll send you a secure
                                    sign-in link.
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
                                        disabled={!canSubmit}>
                                        {status === "sending"
                                            ? "Sending link..."
                                            : "Email me a sign-in link"}
                                    </Button>
                                </form>

                                {process.env.NODE_ENV === "development" && (
                                    <form
                                        onSubmit={onDevPasswordLogin}
                                        className='mt-8 space-y-4 border-t pt-6'>
                                        <p className='text-xs text-muted-foreground'>
                                            Dev login (password)
                                        </p>

                                        <input
                                            type='password'
                                            value={password}
                                            onChange={e =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder='Password'
                                            className='w-full rounded-md border px-3 py-2 text-sm'
                                        />

                                        <Button
                                            type='submit'
                                            variant='secondary'
                                            className='w-full'>
                                            Sign in (dev)
                                        </Button>
                                    </form>
                                )}

                                {status === "success" && (
                                    <Alert className='bg-green-400'>
                                        <AlertTitle>Link sent</AlertTitle>
                                        <AlertDescription className='text-foreground'>
                                            {message} If you don’t see it in a
                                            minute, check spam/promotions.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {status === "error" && (
                                    <Alert className='bg-red-400'>
                                        <AlertTitle>
                                            Couldn’t send link
                                        </AlertTitle>
                                        <AlertDescription className='text-foreground'>
                                            {message}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className='text-sm text-muted-foreground'>
                                    <p className='leading-6'>
                                        Use the same email you used at checkout.
                                    </p>
                                    <p className='mt-2 leading-6'>
                                        Don’t have access yet?{" "}
                                        <Link
                                            href='/courses'
                                            className='font-medium text-foreground underline underline-offset-4'>
                                            View courses
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
