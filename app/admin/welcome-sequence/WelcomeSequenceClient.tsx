"use client";

import * as React from "react";
import { useAdminGuard } from "@/lib/admin/useAdminGuard";
import { supabase } from "@/lib/supabase/client";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Row = {
    id: string;
    email: string;
    first_name: string | null;
    day: number;
    status: string;
    started_at: string;
    next_send_at: string | null;
    last_sent_at: string | null;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    completed: "secondary",
    purchased: "secondary",
    unsubscribed: "outline",
};

export default function WelcomeSequenceClient() {
    const { ready } = useAdminGuard();
    const [rows, setRows] = React.useState<Row[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [busyId, setBusyId] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState("");

    const [testEmail, setTestEmail] = React.useState("");
    const [testFirstName, setTestFirstName] = React.useState("");
    const [enrolling, setEnrolling] = React.useState(false);
    const [runningCron, setRunningCron] = React.useState(false);

    const authedFetch = React.useCallback(
        async (url: string, options: RequestInit = {}) => {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            return fetch(url, {
                ...options,
                headers: {
                    ...(options.headers ?? {}),
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        [],
    );

    const loadRows = React.useCallback(async () => {
        setLoading(true);
        const res = await authedFetch("/api/admin/welcome-sequence");
        const json = await res.json();
        if (res.ok) setRows(json.rows ?? []);
        setLoading(false);
    }, [authedFetch]);

    React.useEffect(() => {
        if (ready) loadRows();
    }, [ready, loadRows]);

    async function handleEnroll(e: React.FormEvent) {
        e.preventDefault();
        if (!testEmail.trim()) return;
        setEnrolling(true);
        setMessage("");
        const res = await authedFetch("/api/admin/welcome-sequence/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail.trim(),
                firstName: testFirstName.trim(),
                reset: true,
            }),
        });
        const json = await res.json();
        const outcomeText: Record<string, string> = {
            sent_day_1: `Enrolled ${testEmail.trim()} and sent Day 1.`,
            purchased: `${testEmail.trim()} already owns a product (has an entitlement) — enrolled straight into "purchased" with no email sent. Use a different test address to see the active drip.`,
            already_enrolled: `${testEmail.trim()} was already enrolled and reset failed to clear it — try again.`,
        };
        setMessage(
            res.ok
                ? (outcomeText[json.outcome?.action] ?? JSON.stringify(json))
                : `Error: ${json.error}`,
        );
        setEnrolling(false);
        loadRows();
    }

    async function handleAdvance(id: string) {
        setBusyId(id);
        setMessage("");
        const res = await authedFetch("/api/admin/welcome-sequence/advance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const json = await res.json();
        setMessage(
            res.ok
                ? `Advanced: ${JSON.stringify(json.outcome)}`
                : `Error: ${json.error}`,
        );
        setBusyId(null);
        loadRows();
    }

    async function handleDelete(id: string) {
        setBusyId(id);
        await authedFetch(`/api/admin/welcome-sequence/${id}`, { method: "DELETE" });
        setBusyId(null);
        loadRows();
    }

    async function handleRunCron() {
        setRunningCron(true);
        setMessage("");
        const res = await authedFetch("/api/admin/welcome-sequence/run-cron", {
            method: "POST",
        });
        const json = await res.json();
        setMessage(
            res.ok
                ? `Cron run: ${JSON.stringify(json)}`
                : `Error: ${json.error}`,
        );
        setRunningCron(false);
        loadRows();
    }

    if (!ready) return null;

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <div className='mx-auto max-w-4xl px-6 pt-10 pb-16'>
                <div className='flex items-center gap-3 mb-1'>
                    <Badge variant='secondary'>Admin</Badge>
                </div>
                <h1 className='text-3xl font-semibold tracking-tight mt-3 mb-2'>
                    Welcome Sequence
                </h1>
                <p className='text-sm text-muted-foreground mb-8'>
                    Test the 7-day drip against your own inbox before it goes
                    live to real subscribers. &quot;Advance&quot; sends the
                    next email immediately, ignoring the 24h delay, and
                    exercises the same purchase/unsubscribe exit checks the
                    real cron uses.
                </p>

                <Card className='rounded-3xl mb-8'>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            Enroll a test email
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleEnroll}
                            className='flex flex-wrap items-end gap-3'>
                            <div className='space-y-1.5'>
                                <Label htmlFor='testEmail'>Email</Label>
                                <Input
                                    id='testEmail'
                                    type='email'
                                    value={testEmail}
                                    onChange={e => setTestEmail(e.target.value)}
                                    placeholder='you@example.com'
                                    className='w-64'
                                />
                            </div>
                            <div className='space-y-1.5'>
                                <Label htmlFor='testFirstName'>
                                    First name (optional)
                                </Label>
                                <Input
                                    id='testFirstName'
                                    value={testFirstName}
                                    onChange={e =>
                                        setTestFirstName(e.target.value)
                                    }
                                    placeholder='Lauren'
                                    className='w-48'
                                />
                            </div>
                            <Button
                                type='submit'
                                disabled={enrolling || !testEmail.trim()}>
                                {enrolling
                                    ? "Enrolling…"
                                    : "Enroll & send Day 1"}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleRunCron}
                                disabled={runningCron}>
                                {runningCron
                                    ? "Running…"
                                    : "Run real cron logic now"}
                            </Button>
                        </form>
                        <p className='text-xs text-muted-foreground mt-2'>
                            Enrolling with an email already in the table
                            below resets and restarts it at Day 1.
                        </p>
                    </CardContent>
                </Card>

                {message && (
                    <Alert className='mb-6'>
                        <AlertDescription className='text-foreground text-sm break-all'>
                            {message}
                        </AlertDescription>
                    </Alert>
                )}

                <Card className='rounded-3xl'>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            {loading ? "Loading…" : `${rows.length} rows`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='border-b text-left text-muted-foreground'>
                                    <th className='py-2 pr-4 font-medium'>
                                        Email
                                    </th>
                                    <th className='py-2 pr-4 font-medium'>
                                        Day
                                    </th>
                                    <th className='py-2 pr-4 font-medium'>
                                        Status
                                    </th>
                                    <th className='py-2 pr-4 font-medium'>
                                        Next send
                                    </th>
                                    <th className='py-2 pr-4 font-medium'>
                                        Last sent
                                    </th>
                                    <th className='py-2 font-medium'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr
                                        key={row.id}
                                        className='border-b last:border-0'>
                                        <td className='py-2 pr-4'>
                                            {row.email}
                                        </td>
                                        <td className='py-2 pr-4'>
                                            {row.day}/7
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <Badge
                                                variant={
                                                    STATUS_VARIANT[
                                                        row.status
                                                    ] ?? "outline"
                                                }>
                                                {row.status}
                                            </Badge>
                                        </td>
                                        <td className='py-2 pr-4 text-xs text-muted-foreground'>
                                            {row.next_send_at
                                                ? new Date(
                                                      row.next_send_at,
                                                  ).toLocaleString()
                                                : "—"}
                                        </td>
                                        <td className='py-2 pr-4 text-xs text-muted-foreground'>
                                            {row.last_sent_at
                                                ? new Date(
                                                      row.last_sent_at,
                                                  ).toLocaleString()
                                                : "—"}
                                        </td>
                                        <td className='py-2 flex gap-2 justify-end'>
                                            {row.status === "active" && (
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    disabled={
                                                        busyId === row.id
                                                    }
                                                    onClick={() =>
                                                        handleAdvance(row.id)
                                                    }>
                                                    Advance
                                                </Button>
                                            )}
                                            <Button
                                                size='sm'
                                                variant='ghost'
                                                disabled={busyId === row.id}
                                                onClick={() =>
                                                    handleDelete(row.id)
                                                }>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className='py-6 text-center text-muted-foreground'>
                                            No rows yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
