"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/useAuth";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { LibraryTab } from "@/components/site/LibraryTab";
import { HairProfileTab } from "@/components/site/HairProfileTab";
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
import { Separator } from "@/components/ui/separator";

type Status = "idle" | "saving" | "success" | "error";

const STRIPE_PORTAL_URL = "https://billing.stripe.com/p/login/7sY6oIbT56x4b5Y0PV4c800";

export default function AccountClient() {
    const router = useRouter();

    const { signedIn, loading } = useAuth();

    const [tab, setTab] = React.useState("library");

    // profile state
    const [displayName, setDisplayName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

    const [newEmail, setNewEmail] = React.useState("");

    const [status, setStatus] = React.useState<Status>("idle");
    const [message, setMessage] = React.useState("");
    const [avatarUploading, setAvatarUploading] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState<string | null>(null);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);

    // Read tab once on mount
    React.useEffect(() => {
        const t =
            new URLSearchParams(window.location.search).get("tab") || "library";
        setTab(t);
    }, []);

    // Load user
    React.useEffect(() => {
        const run = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data.user;
            if (!user) return;

            setEmail(user.email ?? "");
            setNewEmail(user.email ?? "");
            setDisplayName((user.user_metadata as any)?.display_name ?? "");
            setAvatarUrl((user.user_metadata as any)?.avatar_url ?? null);
        };

        if (!loading) run();
    }, [loading]);

    // Guard
    React.useEffect(() => {
        if (!loading && !signedIn) {
            router.replace(
                `/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
            );
        }
    }, [loading, signedIn, router]);

    // Keep URL in sync
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

    async function onAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setAvatarUploading(true);
        setAvatarError(null);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error("Not signed in.");

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/account/avatar", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Upload failed.");

            setAvatarUrl(json.avatarUrl);
        } catch (err: any) {
            setAvatarError(err?.message ?? "Could not upload photo.");
        } finally {
            setAvatarUploading(false);
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
                <div className='bg-background/50 rounded-3xl p-6 flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={avatarUrl}
                                alt='Profile picture'
                                className='h-12 w-12 shrink-0 rounded-full object-cover'
                            />
                        ) : (
                            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-base font-semibold select-none'>
                                {(displayName || email).charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className='text-xl font-semibold tracking-tight'>
                                {displayName
                                    ? `Hi, ${displayName.split(" ")[0]}`
                                    : "My account"}
                            </h1>
                            <p className='text-sm'>
                                {email}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant='secondary'
                        size='sm'
                        onClick={onSignOut}>
                        Sign out
                    </Button>
                </div>

                <div className='mt-8'>
                    <Tabs
                        value={tab}
                        onValueChange={setTab}
                        className='w-full'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='library'>Library</TabsTrigger>
                            <TabsTrigger value='profile'>Profile</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value='library'
                            className='mt-6'>
                            <LibraryTab />
                        </TabsContent>

                        <TabsContent
                            value='hair-profile'
                            className='mt-6'>
                            <HairProfileTab />
                        </TabsContent>

                        <TabsContent
                            value='profile'
                            className='mt-6 space-y-6'>
                            <Card className='rounded-3xl'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Profile settings
                                    </CardTitle>
                                    <CardDescription>
                                        Your photo, name, and email address.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6'>
                                    <div className='space-y-2'>
                                        <Label>Profile picture</Label>
                                        <div className='flex items-center gap-4'>
                                            {avatarUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={avatarUrl}
                                                    alt='Profile picture'
                                                    className='h-16 w-16 rounded-full object-cover'
                                                />
                                            ) : (
                                                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background text-lg font-semibold select-none'>
                                                    {(
                                                        displayName || email
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <input
                                                    ref={avatarInputRef}
                                                    type='file'
                                                    accept='image/*'
                                                    className='hidden'
                                                    onChange={onAvatarSelected}
                                                />
                                                <Button
                                                    type='button'
                                                    variant='secondary'
                                                    size='sm'
                                                    disabled={avatarUploading}
                                                    onClick={() =>
                                                        avatarInputRef.current?.click()
                                                    }>
                                                    {avatarUploading
                                                        ? "Uploading…"
                                                        : "Change photo"}
                                                </Button>
                                                {avatarError && (
                                                    <p className='mt-2 text-sm text-destructive'>
                                                        {avatarError}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <form
                                        onSubmit={onSaveDisplayName}
                                        className='space-y-4'>
                                        <div className='space-y-2 w-full sm:w-1/2 lg:w-1/4'>
                                            <Label htmlFor='displayName'>
                                                Name
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
                                                : "Save name"}
                                        </Button>
                                    </form>

                                    <Separator />

                                    <form
                                        onSubmit={onChangeEmail}
                                        className='space-y-4'>
                                        <div className='space-y-2 w-full sm:w-1/2 lg:w-1/4'>
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
                                            <p className='text-xs text-muted-foreground'>
                                                You&apos;ll receive a
                                                confirmation link when you
                                                change this.
                                            </p>
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
                                        Billing
                                    </CardTitle>
                                    <CardDescription>
                                        Update your payment method, view
                                        receipts, or manage your billing
                                        details directly with Stripe.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <a
                                            href={STRIPE_PORTAL_URL}
                                            target='_blank'
                                            rel='noopener noreferrer'>
                                            Manage billing
                                        </a>
                                    </Button>
                                    <p className='mt-3 text-xs text-muted-foreground'>
                                        Note: this manages your Stripe
                                        billing profile only. Changing your
                                        name or email here won&apos;t update
                                        your Hair Insider account, if you
                                        want those to match, update them
                                        above too.
                                    </p>
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
                                            ? "Couldn't save"
                                            : "Saved"}
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
