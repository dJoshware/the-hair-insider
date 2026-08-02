import 'server-only';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY!);
const admin = createSupabaseAdminClient();

export const SEQUENCE_LENGTH = 7;

const SUBJECTS: Record<number, string> = {
    1: "Your 7-Day Moisture Reset is ready",
    2: "If softness fades by Day 3, adjust this",
    3: "Sequence over more products",
    4: "Wash day, simplified",
    5: "The seal that actually lasts",
    6: "Use what you have — plus my vetted faves",
    7: "Day-7 check-in: what changed?",
};

function unsubscribeUrl(email: string): string {
    const secret = process.env.EMAIL_UNSUB_SECRET!;
    const token = crypto
        .createHmac('sha256', secret)
        .update(email.toLowerCase())
        .digest('hex');
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-hair-insider.com';
    return `${site}/api/email/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

function renderTemplate(day: number, email: string, firstName: string): string {
    const templatePath = path.join(process.cwd(), 'emails', 'welcome', `day${day}.html`);
    let html = fs.readFileSync(templatePath, 'utf-8');
    html = html
        .replace(/\{\{firstName\}\}/g, firstName || 'there')
        .replace(/\{\{year\}\}/g, String(new Date().getFullYear()))
        .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl(email));
    return html;
}

async function sendDay(day: number, email: string, firstName: string) {
    const { error } = await resend.emails.send({
        from:
            process.env.CONTACT_FROM_EMAIL ??
            'The Hair Insider <hello@the-hair-insider.com>',
        replyTo: process.env.RESEND_REPLY_TO ?? 'thehairinsidersociety@gmail.com',
        to: email,
        subject: SUBJECTS[day],
        html: renderTemplate(day, email, firstName),
    });
    if (error) {
        throw new Error(`Resend send failed for day ${day} to ${email}: ${error.message}`);
    }
}

async function upsertResendContact(email: string, firstName: string) {
    try {
        await resend.contacts.create({ email, firstName, unsubscribed: false });
    } catch {
        // Already exists — make sure it's marked subscribed and has a name.
        await resend.contacts.update({ email, firstName, unsubscribed: false }).catch(e => {
            console.error('Resend contact update failed:', e);
        });
    }
}

async function isResendUnsubscribed(email: string): Promise<boolean> {
    try {
        const { data } = await resend.contacts.get(email);
        return data?.unsubscribed ?? false;
    } catch {
        // Contact not found or lookup failed — don't block sending on this.
        return false;
    }
}

/**
 * A purchase (claimed into an account, or still a pending guest purchase)
 * ends the sequence — no reason to keep pitching products they already own.
 */
async function hasAnyPurchase(email: string): Promise<boolean> {
    const { data: pending } = await admin
        .from('pending_entitlements')
        .select('id')
        .ilike('email', email)
        .limit(1);
    if (pending && pending.length > 0) return true;

    const { data: rows } = await admin.rpc('get_user_id_by_email', {
        p_email: email,
    });
    const userId = rows?.[0]?.id;
    if (!userId) return false;

    const { data: ent } = await admin
        .from('entitlements')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1);
    return !!(ent && ent.length > 0);
}

export type EnrollOutcome =
    | { action: 'already_enrolled' }
    | { action: 'purchased' }
    | { action: 'sent_day_1' };

export async function enrollInWelcomeSequence(
    email: string,
    firstName: string,
): Promise<EnrollOutcome> {
    const normalized = email.trim().toLowerCase();

    const { data: existing } = await admin
        .from('welcome_sequence')
        .select('id')
        .ilike('email', normalized)
        .maybeSingle();

    // Already tracked (active, completed, purchased, or previously
    // unsubscribed) — don't restart or re-enroll them.
    if (existing) return { action: 'already_enrolled' };

    await upsertResendContact(normalized, firstName);

    if (await hasAnyPurchase(normalized)) {
        await admin.from('welcome_sequence').insert({
            email: normalized,
            first_name: firstName || null,
            day: SEQUENCE_LENGTH,
            status: 'purchased',
            next_send_at: null,
        });
        return { action: 'purchased' };
    }

    await sendDay(1, normalized, firstName);

    await admin.from('welcome_sequence').insert({
        email: normalized,
        first_name: firstName || null,
        day: 1,
        status: 'active',
        last_sent_at: new Date().toISOString(),
        next_send_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return { action: 'sent_day_1' };
}

export type WelcomeSequenceRow = {
    id: string;
    email: string;
    first_name: string | null;
    day: number;
    status: string;
};

/**
 * Advances one row by exactly one step: exits it (purchased/unsubscribed)
 * or sends the next day's email. Shared by the cron job and the admin
 * "advance now" test action so both paths exercise identical logic.
 */
export async function processWelcomeSequenceRow(row: WelcomeSequenceRow) {
    if (row.status !== 'active') return { action: 'skipped' as const };

    if (await isResendUnsubscribed(row.email)) {
        await admin
            .from('welcome_sequence')
            .update({ status: 'unsubscribed', next_send_at: null })
            .eq('id', row.id);
        return { action: 'unsubscribed' as const };
    }

    if (await hasAnyPurchase(row.email)) {
        await admin
            .from('welcome_sequence')
            .update({ status: 'purchased', next_send_at: null })
            .eq('id', row.id);
        return { action: 'purchased' as const };
    }

    const nextDay = row.day + 1;
    await sendDay(nextDay, row.email, row.first_name ?? '');

    const done = nextDay >= SEQUENCE_LENGTH;
    await admin
        .from('welcome_sequence')
        .update({
            day: nextDay,
            last_sent_at: new Date().toISOString(),
            status: done ? 'completed' : 'active',
            next_send_at: done
                ? null
                : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', row.id);

    return { action: 'sent' as const, day: nextDay };
}

// Process at most this many rows per invocation so a single run can't run
// away with the function's execution time budget; the next hourly run picks
// up whatever's left over.
const BATCH_SIZE = 200;

export async function runDueWelcomeSequenceBatch() {
    const { data: due, error } = await admin
        .from('welcome_sequence')
        .select('id, email, first_name, day, status')
        .eq('status', 'active')
        .lte('next_send_at', new Date().toISOString())
        .limit(BATCH_SIZE);

    if (error) throw new Error(error.message);

    const results = { sent: 0, purchased: 0, unsubscribed: 0, failed: 0 };

    for (const row of due ?? []) {
        try {
            const outcome = await processWelcomeSequenceRow(row);
            if (outcome.action === 'sent') results.sent++;
            else if (outcome.action === 'purchased') results.purchased++;
            else if (outcome.action === 'unsubscribed') results.unsubscribed++;
        } catch (e) {
            results.failed++;
            console.error(`Welcome sequence failed for ${row.email}:`, e);
        }
        // Stay comfortably under Resend's rate limit.
        await new Promise(r => setTimeout(r, 120));
    }

    return { processed: (due ?? []).length, ...results };
}
