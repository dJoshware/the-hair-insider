"use client";

import * as React from "react";
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
import { Eye, EyeOff } from "lucide-react";

type Status = "idle" | "sending" | "success" | "error";
type Mode = "signin" | "signup";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function PasswordField({
    id,
    label,
    value,
    onChange,
    disabled,
    autoComplete,
    placeholder,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    autoComplete?: string;
    placeholder?: string;
}) {
    const [show, setShow] = React.useState(false);

    return (
        <div className='space-y-2'>
            <Label htmlFor={id}>{label}</Label>
            <div className='relative'>
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    className='pr-10'
                />
                <button
                    type='button'
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow(s => !s)}
                    disabled={disabled}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50'>
                    {show ? (
                        <EyeOff className='h-4 w-4' />
                    ) : (
                        <Eye className='h-4 w-4' />
                    )}
                </button>
            </div>
        </div>
    );
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

    const destination = params?.get("next") || "/";

    const canSubmit = React.useMemo(() => {
        if (status === "sending") return false;
        if (!isValidEmail(email)) return false;
        if (!password || password.length < 8) return false;
        if (mode === "signup" && password !== confirmPassword) return false;
        return true;
    }, [status, email, password, confirmPassword, mode]);

    async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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

        if (params?.get("next")) {
            localStorage.setItem("postAuthRedirect", params.get("next")!);
        }

        try {
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
                window.location.href = destination;
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;

            if (!data.session) {
                setStatus("success");
                setMessage(
                    "Check your email to confirm your account, then sign in.",
                );
                setMode("signin");
                return;
            }

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
            window.location.href = destination;
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
                localStorage.removeItem("postAuthRedirect");
            } catch {}

            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });

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
                    <div className='w-[350px] max-w-md'>
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

                                    <PasswordField
                                        id='password'
                                        label={
                                            mode === "signin"
                                                ? "Password"
                                                : "Create a password"
                                        }
                                        value={password}
                                        onChange={setPassword}
                                        disabled={status === "sending"}
                                        autoComplete={
                                            mode === "signin"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        placeholder='Minimum 8 characters'
                                    />

                                    {mode === "signup" && (
                                        <PasswordField
                                            id='confirmPassword'
                                            label='Confirm password'
                                            value={confirmPassword}
                                            onChange={setConfirmPassword}
                                            disabled={status === "sending"}
                                            autoComplete='new-password'
                                            placeholder='Re-enter password'
                                        />
                                    )}

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

                                    <div className='flex items-center justify-between text-sm w-full'>
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
                            </CardContent>
                        </Card>
                    </div>
                </FadeIn>
            </main>
        </div>
    );
}
