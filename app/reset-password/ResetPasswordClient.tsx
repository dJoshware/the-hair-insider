"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useSearchParams();
    const next = params.get("next") || "/library";

    const [pw1, setPw1] = React.useState("");
    const [pw2, setPw2] = React.useState("");
    const [status, setStatus] = React.useState<
        "idle" | "saving" | "success" | "error"
    >("idle");
    const [message, setMessage] = React.useState("");
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange(event => {
            if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
                setReady(true);
            }
        });

        setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) setReady(true);
        }, 250);

        return () => sub.subscription.unsubscribe();
    }, []);

    async function onSubmit(e: React.SubmitEvent) {
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
            router.replace(next);
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
                                            <Input
                                                id='pw1'
                                                type='password'
                                                autoComplete='new-password'
                                                value={pw1}
                                                onChange={e =>
                                                    setPw1(e.target.value)
                                                }
                                                disabled={status === "saving"}
                                            />
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor='pw2'>
                                                Confirm new password
                                            </Label>
                                            <Input
                                                id='pw2'
                                                type='password'
                                                autoComplete='new-password'
                                                value={pw2}
                                                onChange={e =>
                                                    setPw2(e.target.value)
                                                }
                                                disabled={status === "saving"}
                                            />
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
