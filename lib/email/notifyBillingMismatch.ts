import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function notifyBillingMismatch({
    accountEmail,
    accountName,
    billingEmail,
    billingName,
}: {
    accountEmail: string;
    accountName: string;
    billingEmail: string | null;
    billingName: string | null;
}) {
    const rows: string[] = [];
    if (billingName && billingName.trim().toLowerCase() !== accountName.trim().toLowerCase()) {
        rows.push(
            `<tr><td style="padding:4px 0;font-size:15px;">Name</td><td style="padding:4px 0;font-size:15px;"><strong>${accountName || '(not set)'}</strong></td><td style="padding:4px 0;font-size:15px;">${billingName}</td></tr>`,
        );
    }
    if (billingEmail && billingEmail.trim().toLowerCase() !== accountEmail.trim().toLowerCase()) {
        rows.push(
            `<tr><td style="padding:4px 0;font-size:15px;">Email</td><td style="padding:4px 0;font-size:15px;"><strong>${accountEmail}</strong></td><td style="padding:4px 0;font-size:15px;">${billingEmail}</td></tr>`,
        );
    }

    if (rows.length === 0) return;

    const html = `
        <div style="font-family:sans-serif;color:#343430;max-width:520px;">
            <p>Hi there,</p>
            <p>Just a heads-up: you recently updated your billing details in Stripe, and they no longer match your Hair Insider account.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse;width:100%;">
                <tr>
                    <td style="padding:4px 0;font-size:13px;font-weight:bold;text-transform:uppercase;color:#7c7e73;"></td>
                    <td style="padding:4px 0;font-size:13px;font-weight:bold;text-transform:uppercase;color:#7c7e73;">Hair Insider account</td>
                    <td style="padding:4px 0;font-size:13px;font-weight:bold;text-transform:uppercase;color:#7c7e73;">Stripe billing</td>
                </tr>
                ${rows.join('')}
            </table>
            <p>This isn't a problem, your purchases and access are unaffected either way. It's just worth knowing in case you'd like the two to match, for example if you use a different email for receipts than the one you sign in with.</p>
            <p>If you want to update your account to match, you can do that from your <a href="https://the-hair-insider.com/account?tab=profile">profile settings</a>.</p>
            <p>Talk soon,<br>The Hair Insider</p>
        </div>
    `;

    const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? 'The Hair Insider <hello@the-hair-insider.com>',
        replyTo: process.env.RESEND_REPLY_TO ?? 'thehairinsidersociety@gmail.com',
        to: accountEmail,
        subject: 'Your billing details don’t match your account',
        html,
    });

    if (error) {
        console.error('Billing mismatch email failed:', error);
    }
}
