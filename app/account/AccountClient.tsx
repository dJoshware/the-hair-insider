"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { LibraryTab } from "@/components/site/LibraryTab";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Status = "idle" | "saving" | "success" | "error";

export default function AccountClient() {
    const router = useRouter();
    const params = useSearchParams();
    const initialTab = params.get("tab") || "library";

    const { signedIn, loading } = useAuth();

    const [tab, setTab] = React.useState(initialTab);

    // profile state
    const [displayName, setDisplayName] = React.useState("");
    const [email, setEmail] = React.useState("");

    // forms
    const [newEmail, setNewEmail] = React.useState("");
    const [pw1, setPw1] = React.useState("");
    const [pw2, setPw2] = React.useState("");
    const [showPw, setShowPw] = React.useState(false);

    const [status, setStatus] = React.useState<Status>("idle");
    const [message, setMessage] = React.useState("");

    // Load user
    React.useEffect(() => {
        const run = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data.user;
            if (!user) return;

            setEmail(user.email ?? "");
            setNewEmail(user.email ?? "");
            setDisplayName((user.user_metadata as any)?.display_name ?? "");
        };

        if (!loading) run();
    }, [loading]);

    // Guard
    React.useEffect(() => {
        if (!loading && !signedIn) router.replace("/signin");
    }, [loading, signedIn, router]);

    // Keep URL in sync (optional)
    React.useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState({}, "", url.toString());
    }, [tab]);

    async function onSaveDisplayName(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("saving");
        setMessage("");

        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: displayName.trim() || null },
            });
            if (error) throw error;

            setStatus("success");
            setMessage("Profile updated.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Could not update profile.");
        }
    }

    async function onChangeEmail(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("saving");
        setMessage("");

        try {
            const nextEmail = newEmail.trim();
            if (!nextEmail.includes("@")) {
                setStatus("error");
                setMessage("Enter a valid email address.");
                return;
            }

            const { error } = await supabase.auth.updateUser({
                email: nextEmail,
            });
            if (error) throw error;

            setStatus("success");
            setMessage("Check your email to confirm the change.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Could not update email.");
        }
    }

    async function onChangePassword(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("saving");
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

        try {
            const { error } = await supabase.auth.updateUser({ password: pw1 });
            if (error) throw error;

            setPw1("");
            setPw2("");

            setStatus("success");
            setMessage("Password updated.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.message ?? "Could not update password.");
        }
    }

    async function onSignOut() {
        await supabase.auth.signOut();
        router.replace("/");
    }

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main className='mx-auto max-w-6xl px-6 py-10'>
                <div className='flex items-end justify-between gap-4'>
                    <div>
                        <h1 className='text-3xl font-semibold tracking-tight'>
                            Account
                        </h1>
                        <p className='mt-1 text-sm'>
                            {email || " "}
                        </p>
                    </div>

                    <Button
                        variant='secondary'
                        onClick={onSignOut}>
                        Sign out
                    </Button>
                </div>

                <div className='mt-8'>
                    <Tabs
                        value={tab}
                        onValueChange={setTab}
                        className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='library'>Library</TabsTrigger>
                            <TabsTrigger value='profile'>Profile</TabsTrigger>
                            <TabsTrigger value='security'>Security</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value='library'
                            className='mt-6'>
                            <LibraryTab />
                        </TabsContent>

                        <TabsContent
                            value='profile'
                            className='mt-6'>
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Profile
                                    </CardTitle>
                                    <CardDescription>
                                        Basic account details.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6'>
                                    <form
                                        onSubmit={onSaveDisplayName}
                                        className='space-y-4'>
                                        <div className='space-y-2 w-1/4'>
                                            <Label htmlFor='displayName'>
                                                Display name
                                            </Label>
                                            <Input
                                                id='displayName'
                                                value={displayName}
                                                onChange={e =>
                                                    setDisplayName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder='Your name'
                                                disabled={status === "saving"}
                                            />
                                        </div>

                                        <Button
                                            type='submit'
                                            disabled={status === "saving"}>
                                            {status === "saving"
                                                ? "Saving…"
                                                : "Save"}
                                        </Button>
                                    </form>

                                    {status !== "idle" ? (
                                        <Alert
                                            className={
                                                status === "error"
                                                    ? "bg-red-400"
                                                    : "bg-green-400"
                                            }>
                                            <AlertTitle>
                                                {status === "error"
                                                    ? "Couldn’t save"
                                                    : "Saved"}
                                            </AlertTitle>
                                            <AlertDescription className='text-foreground'>
                                                {message}
                                            </AlertDescription>
                                        </Alert>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent
                            value='security'
                            className='mt-6 space-y-6'>
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Change email
                                    </CardTitle>
                                    <CardDescription>
                                        You may be asked to confirm this change
                                        via email.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={onChangeEmail}
                                        className='space-y-4'>
                                        <div className='space-y-2 w-1/4'>
                                            <Label htmlFor='newEmail'>
                                                Email
                                            </Label>
                                            <Input
                                                id='newEmail'
                                                type='email'
                                                value={newEmail}
                                                onChange={e =>
                                                    setNewEmail(e.target.value)
                                                }
                                                disabled={status === "saving"}
                                            />
                                        </div>
                                        <Button
                                            type='submit'
                                            disabled={status === "saving"}>
                                            {status === "saving"
                                                ? "Saving…"
                                                : "Update email"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Change password
                                    </CardTitle>
                                    <CardDescription>
                                        Minimum 8 characters.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={onChangePassword}
                                        className='space-y-4'>
                                        <div className='space-y-2 w-1/4'>
                                            <Label htmlFor='pw1'>
                                                New password
                                            </Label>
                                            <div className='relative'>
                                                <Input
                                                    id='pw1'
                                                    type={
                                                        showPw
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
                                                        setShowPw(v => !v)
                                                    }
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs underline underline-offset-4'>
                                                    {showPw ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className='space-y-2 w-1/4'>
                                            <Label htmlFor='pw2'>
                                                Confirm password
                                            </Label>
                                            <Input
                                                id='pw2'
                                                type={
                                                    showPw ? "text" : "password"
                                                }
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
                                            disabled={status === "saving"}>
                                            {status === "saving"
                                                ? "Saving…"
                                                : "Update password"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {status !== "idle" ? (
                                <Alert
                                    className={
                                        status === "error"
                                            ? "bg-red-400"
                                            : "bg-green-400"
                                    }>
                                    <AlertTitle>
                                        {status === "error"
                                            ? "Couldn’t update"
                                            : "Success"}
                                    </AlertTitle>
                                    <AlertDescription className='text-foreground'>
                                        {message}
                                    </AlertDescription>
                                </Alert>
                            ) : null}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
