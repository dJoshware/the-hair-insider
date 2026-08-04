import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * Creates (or updates) the Resend contact and fires the "welcome-started"
 * event, matching what the old Mailchimp flow did in one step (subscribe +
 * tag). The event itself is a no-op if the native Automation listening for
 * it is disabled, so this is safe to call regardless of automation status.
 */
export async function enrollInResendWelcome(email: string, firstName?: string) {
    const normalized = email.trim().toLowerCase();

    try {
        await resend.contacts.create({
            email: normalized,
            firstName: firstName || undefined,
            unsubscribed: false,
        });
    } catch {
        await resend.contacts.update({ email: normalized, unsubscribed: false }).catch(e => {
            console.error('Resend contact update failed:', e);
        });
    }

    const res = await fetch('https://api.resend.com/events/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: 'welcome-started',
            email: normalized,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('Resend welcome-started event failed:', res.status, text);
    }
}
