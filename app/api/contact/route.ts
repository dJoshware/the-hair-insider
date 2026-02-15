import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

export const runtime = 'nodejs';

const Body = z.object({
    name: z.string().max(120).optional().default(''),
    email: z.string().email(),
    topic: z.string().max(120).optional().default('General'),
    message: z.string().min(5).max(4000),
    company: z.string().optional().default(''), // honeypot
});

function escapeHtml(s: string) {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export async function POST(req: Request) {
    try {
        const parsed = Body.parse(await req.json());

        // Honeypot: bots fill this. Pretend success so they don't learn.
        if (parsed.company.trim().length > 0) {
            return NextResponse.json({ ok: true });
        }

        const apiKey = process.env.RESEND_API_KEY;
        const to = process.env.CONTACT_TO_EMAIL;
        const from = process.env.CONTACT_FROM_EMAIL;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing RESEND_API_KEY' },
                { status: 500 },
            );
        }
        if (!to) {
            return NextResponse.json(
                { error: 'Missing CONTACT_TO_EMAIL' },
                { status: 500 },
            );
        }
        if (!from) {
            return NextResponse.json(
                { error: 'Missing CONTACT_FROM_EMAIL' },
                { status: 500 },
            );
        }

        const resend = new Resend(apiKey);

        const subject = `[THI] ${parsed.topic} — ${parsed.email}`;

        const html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>New contact message</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #7C7E73;
                font-family: ui-serif, Baskerville, Georgia, 'Times New Roman', Times, serif;
                color: #343430;
                ">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
                <tr>
                    <td align="center">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
                        max-width: 520px;
                        background-color: #DDD9D5;
                        border-radius: 16px;
                        padding: 32px;
                        ">
                        <!-- Header -->
                        <tr>
                        <td style="padding-bottom: 16px;">
                            <p style="
                                margin: 0;
                                font-size: 14px;
                                letter-spacing: 0.04em;
                                text-transform: uppercase;
                                color: #343430;
                            ">
                            The Hair Insider
                            </p>
                        </td>
                        </tr>

                        <!-- Title -->
                        <tr>
                        <td style="padding-bottom: 16px;">
                            <h1 style="
                                margin: 0;
                                font-size: 24px;
                                font-weight: 600;
                                line-height: 1.3;
                            ">
                            New contact message
                            </h1>
                        </td>
                        </tr>

                        <!-- Meta -->
                        <tr>
                        <td style="padding-bottom: 18px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #343430;">
                            <strong>Name:</strong> ${escapeHtml(parsed.name || '—')}<br/>
                            <strong>Email:</strong> ${escapeHtml(parsed.email)}<br/>
                            <strong>Topic:</strong> ${escapeHtml(parsed.topic || 'General')}
                            </p>
                        </td>
                        </tr>

                        <!-- Message box -->
                        <tr>
                        <td style="padding-bottom: 22px;">
                            <div style="
                                background-color: #F6F4F0;
                                border: 1px solid #CFCAC6;
                                border-radius: 12px;
                                padding: 14px;
                            ">
                            <p style="
                                margin: 0 0 8px;
                                font-size: 13px;
                                letter-spacing: 0.04em;
                                text-transform: uppercase;
                                color: #343430;
                                ">
                                Message
                            </p>
                            <div style="
                                margin: 0;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #343430;
                                white-space: pre-wrap;
                                word-break: break-word;
                                ">${escapeHtml(parsed.message)}</div>
                            </div>
                        </td>
                        </tr>

                        <!-- Reply CTA (optional but nice) -->
                        <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <a href="mailto:${encodeURIComponent(parsed.email)}" style="
                                display: inline-block;
                                padding: 12px 18px;
                                background-color: #343430;
                                color: #ffffff;
                                text-decoration: none;
                                font-size: 14px;
                                font-weight: 600;
                                border-radius: 9999px;
                            ">
                            Reply to ${escapeHtml(parsed.name || 'sender')}
                            </a>
                        </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                        <td style="border-top: 1px solid #CFCAC6; padding-top: 16px;">
                            <p style="
                                margin: 0;
                                font-size: 12px;
                                line-height: 1.5;
                                color: #343430;
                            ">
                            Sent from the Hair Insider contact form.
                            </p>
                        </td>
                        </tr>
                    </table>

                    <!-- Outer footer -->
                    <p style="
                        margin: 16px 0 0;
                        font-size: 12px;
                        color: #DDD9D5;
                        ">
                        © 2026 The Hair Insider
                    </p>
                    </td>
                </tr>
                </table>
            </body>
            </html>`;

        // IMPORTANT: set reply_to so you can hit "Reply" in Gmail and it replies to the user.
        const { error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
            replyTo: parsed.email,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        const msg =
            err instanceof z.ZodError
                ? 'Invalid form data.'
                : err instanceof Error
                  ? err.message
                  : 'Invalid request';
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
