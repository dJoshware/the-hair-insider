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
type Mode = "signin" | "signup";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignInClient() {
    const [mode, setMode] = React.useState<Mode>("signin");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [status, setStatus] = React.useState<Status>("idle");
    const [message, setMessage] = React.useState("");

    const params =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;

    const next =
        params?.get("next") ||
        (typeof window !== "undefined"
            ? localStorage.getItem("postAuthRedirect") || "/"
            : "/");

    const canSubmit = React.useMemo(() => {
        if (status === "sending") return false;
        if (!isValidEmail(email)) return false;
        if (!password || password.length < 8) return false;
        if (mode === "signup" && password !== confirmPassword) return false;
        return true;
    }, [status, email, password, confirmPassword, mode]);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (!isValidEmail(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setStatus("error");
            setMessage("Password must be at least 8 characters.");
            return;
        }

        if (mode === "signup" && password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        setStatus("sending");

        if (params) {
            const n = params.get("next");
            if (n) localStorage.setItem("postAuthRedirect", n);
        }

        try {
            // Sign In
            if (mode === "signin") {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                const token = data.session?.access_token;
                if (token) {
                    fetch("/api/stripe/ensure-customer", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({}),
                    }).catch(() => {});
                }

                setStatus("success");
                setMessage("Signed in. Redirecting…");
                window.location.href = next;
                return;
            }

            // Sign Up
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;

            // If email confirmations are ON, session will be null until they confirm
            if (!data.session) {
                setStatus("success");
                setMessage(
                    "Check your email to confirm your account, then sign in.",
                );
                setMode("signin");
                return;
            }

            // If confirmations are OFF, they may be signed in immediately
            const token = data.session.access_token;
            fetch("/api/stripe/ensure-customer", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }).catch(() => {});

            setStatus("success");
            setMessage("Account created. Redirecting…");
            window.location.href = next;
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Something went wrong.");
        }
    }

    async function onForgotPassword() {
        setMessage("");
        setStatus("sending");

        try {
            if (!isValidEmail(email)) {
                setStatus("error");
                setMessage("Enter your email above first.");
                return;
            }

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
                                    {mode === "signin"
                                        ? "Sign in"
                                        : "Create account"}
                                </CardTitle>
                                <CardDescription>
                                    {mode === "signin"
                                        ? "Sign in with your email and password."
                                        : "Create your account to access your library."}
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
                                            disabled={status === "sending"}
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='password'>
                                            {mode === "signin"
                                                ? "Password"
                                                : "Create a password"}
                                        </Label>
                                        <Input
                                            id='password'
                                            type='password'
                                            autoComplete={
                                                mode === "signin"
                                                    ? "current-password"
                                                    : "new-password"
                                            }
                                            placeholder='Minimum 8 characters'
                                            value={password}
                                            onChange={e =>
                                                setPassword(e.target.value)
                                            }
                                            disabled={status === "sending"}
                                        />
                                    </div>

                                    {mode === "signup" ? (
                                        <div className='space-y-2'>
                                            <Label htmlFor='confirmPassword'>
                                                Confirm password
                                            </Label>
                                            <Input
                                                id='confirmPassword'
                                                type='password'
                                                autoComplete='new-password'
                                                placeholder='Re-enter password'
                                                value={confirmPassword}
                                                onChange={e =>
                                                    setConfirmPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={status === "sending"}
                                            />
                                        </div>
                                    ) : null}

                                    <Button
                                        type='submit'
                                        className='w-full'
                                        disabled={!canSubmit}>
                                        {status === "sending"
                                            ? "Loading…"
                                            : mode === "signin"
                                              ? "Sign in"
                                              : "Create account"}
                                    </Button>

                                    <div className='flex items-center justify-between text-sm'>
                                        <button
                                            type='button'
                                            className='underline underline-offset-4'
                                            onClick={() => {
                                                setStatus("idle");
                                                setMessage("");
                                                setMode(
                                                    mode === "signin"
                                                        ? "signup"
                                                        : "signin",
                                                );
                                            }}>
                                            {mode === "signin"
                                                ? "Create account"
                                                : "Back to sign in"}
                                        </button>

                                        {mode === "signin" ? (
                                            <button
                                                type='button'
                                                className='underline underline-offset-4'
                                                onClick={onForgotPassword}
                                                disabled={status === "sending"}>
                                                Forgot password
                                            </button>
                                        ) : (
                                            <span className='text-muted-foreground'>
                                                Already have an account?
                                            </span>
                                        )}
                                    </div>
                                </form>

                                {status === "success" && (
                                    <Alert className='bg-green-400'>
                                        <AlertTitle>Success</AlertTitle>
                                        <AlertDescription className='text-foreground'>
                                            {message}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {status === "error" && (
                                    <Alert className='bg-red-400'>
                                        <AlertTitle>
                                            Something went wrong
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
