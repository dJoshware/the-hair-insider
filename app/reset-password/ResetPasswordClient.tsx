"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { useRouter } from "next/navigation";
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

export default function ResetPasswordClient() {
    const router = useRouter();

    const next =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next") ||
              localStorage.getItem("postAuthRedirect") ||
              "/library"
            : "/library";

    const [pw1, setPw1] = React.useState("");
    const [pw2, setPw2] = React.useState("");
    const [show, setShow] = React.useState(false);

    const [status, setStatus] = React.useState<
        "idle" | "saving" | "success" | "error"
    >("idle");
    const [message, setMessage] = React.useState("");
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        let cancelled = false;

        const { data: sub } = supabase.auth.onAuthStateChange(event => {
            if (cancelled) return;
            if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
                setReady(true);
            }
        });

        const run = async () => {
            const params = new URLSearchParams(window.location.search);
            const token_hash = params.get("token_hash");
            const type = params.get("type") || "recovery";

            // If we have a token_hash link, exchange it for a session
            if (token_hash && type === "recovery") {
                const { error } = await supabase.auth.verifyOtp({
                    token_hash,
                    type: "recovery",
                });

                if (cancelled) return;

                if (error) {
                    setMessage(error.message);
                    setStatus("error");
                    setReady(false);
                } else {
                    // ✅ clear token from URL only after success
                    window.history.replaceState({}, "", "/reset-password");
                    setReady(true);
                }
                return;
            }

            // Fallback: check session shortly after mount
            setTimeout(async () => {
                if (cancelled) return;
                const { data } = await supabase.auth.getSession();
                if (data.session && !cancelled) setReady(true);
            }, 250);
        };

        run();

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, []);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (pw1.length < 8) {
            setStatus("error");
            setMessage("Password must be at least 8 characters.");
            return;
        }
        if (pw1 !== pw2) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        setStatus("saving");

        try {
            const { error } = await supabase.auth.updateUser({ password: pw1 });
            if (error) throw error;

            setStatus("success");
            setMessage("Password updated. Redirecting…");

            // optional: clear postAuthRedirect now that we're using next
            try {
                localStorage.removeItem("postAuthRedirect");
            } catch {}

            router.replace("/");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Could not update password.");
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
                                    Choose a new password
                                </CardTitle>
                                <CardDescription>
                                    {ready
                                        ? "Enter a new password for your account."
                                        : "Loading secure reset session…"}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className='space-y-6'>
                                {!ready ? (
                                    <p className='text-sm text-muted-foreground'>
                                        Please wait…
                                    </p>
                                ) : (
                                    <form
                                        onSubmit={onSubmit}
                                        className='space-y-4'>
                                        <div className='space-y-2'>
                                            <Label htmlFor='pw1'>
                                                New password
                                            </Label>
                                            <div className='relative'>
                                                <Input
                                                    id='pw1'
                                                    type={
                                                        show
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    autoComplete='new-password'
                                                    value={pw1}
                                                    onChange={e =>
                                                        setPw1(e.target.value)
                                                    }
                                                    disabled={
                                                        status === "saving"
                                                    }
                                                    className='pr-20'
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setShow(v => !v)
                                                    }
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs underline underline-offset-4'>
                                                    {show ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor='pw2'>
                                                Confirm new password
                                            </Label>
                                            <div className='relative'>
                                                <Input
                                                    id='pw2'
                                                    type={
                                                        show
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    autoComplete='new-password'
                                                    value={pw2}
                                                    onChange={e =>
                                                        setPw2(e.target.value)
                                                    }
                                                    disabled={
                                                        status === "saving"
                                                    }
                                                    className='pr-20'
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        setShow(v => !v)
                                                    }
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs underline underline-offset-4'>
                                                    {show ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                        </div>

                                        <Button
                                            type='submit'
                                            className='w-full'
                                            disabled={status === "saving"}>
                                            {status === "saving"
                                                ? "Saving…"
                                                : "Update password"}
                                        </Button>
                                    </form>
                                )}

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
                                            Couldn’t update password
                                        </AlertTitle>
                                        <AlertDescription className='text-foreground'>
                                            {message}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className='text-sm text-muted-foreground'>
                                    <p className='leading-6'>
                                        If you didn’t request a reset, you can{" "}
                                        <Link
                                            href='/signin'
                                            className='font-medium text-foreground underline underline-offset-4'>
                                            sign in
                                        </Link>{" "}
                                        instead.
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
