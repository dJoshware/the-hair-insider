"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = { inDialog?: boolean };

export function ContactForm({ inDialog }: Props) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [topic, setTopic] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [status, setStatus] = React.useState<"idle" | "success" | "error">(
        "idle",
    );
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    // Honeypot (hide it with CSS). Bots fill it, humans won’t.
    const [company, setCompany] = React.useState("");

    async function onSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setSending(true);
        setStatus("idle");
        setErrorMsg(null);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, topic, message, company }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error ?? "Failed to send.");

            setStatus("success");
            setName("");
            setMessage("");
            // keep email prefilled for convenience
        } catch (err) {
            setStatus("error");
            setErrorMsg(
                err instanceof Error ? err.message : "Something went wrong.",
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <form
            onSubmit={onSubmit}
            className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                    <Label htmlFor='name'>Name</Label>
                    <Input
                        id='name'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder='First Last'
                    />
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='email'>Email *</Label>
                    <Input
                        id='email'
                        type='email'
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder='you@email.com'
                    />
                </div>
            </div>

            {/* Honeypot */}
            <div className='hidden'>
                <Label htmlFor='company'>Company</Label>
                <Input
                    id='company'
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                />
            </div>

            <div className='space-y-2'>
                <Label htmlFor='topic'>Topic</Label>
                <Input
                    id='topic'
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder='General'
                />
                {/* If you want this as a Select, we can swap to shadcn Select */}
            </div>

            <div className='space-y-2'>
                <Label htmlFor='message'>Message *</Label>
                <Textarea
                    id='message'
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder='Tell us what you need help with…'
                    className='min-h-[140px]'
                />
            </div>

            <Button
                type='submit'
                disabled={sending}
                className='h-11 w-full'>
                {sending ? "Sending…" : "Send message"}
            </Button>

            {status === "success" ? (
                <Alert className='bg-green-400'>
                    <AlertTitle>Sent</AlertTitle>
                    <AlertDescription className='text-foreground'>
                        Your message was sent. We’ll reply to{" "}
                        {email || "your email"}.
                    </AlertDescription>
                </Alert>
            ) : null}

            {status === "error" ? (
                <Alert className='bg-red-400'>
                    <AlertTitle>Couldn’t send</AlertTitle>
                    <AlertDescription className='text-foreground'>
                        {errorMsg}
                    </AlertDescription>
                </Alert>
            ) : null}

            {!inDialog ? (
                <p className='text-xs'>
                    For account access issues, include the email you used at
                    checkout.
                </p>
            ) : null}
        </form>
    );
}
