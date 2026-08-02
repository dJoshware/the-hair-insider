// One-off fix: the Mailchimp CSV import into Resend dumped every contact in
// as subscribed, ignoring the unsubscribed/cleaned source files. This walks
// those two CSVs and marks the matching Resend contacts unsubscribed so they
// stop receiving anything.
//
// Usage: RESEND_API_KEY=... node scripts/fix-resend-suppression.cjs [--dry-run]

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) {
    console.error('Missing RESEND_API_KEY');
    process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

const EXPORT_DIR = path.join(
    require('os').homedir(),
    'Downloads',
    'audience_export_fd09b24d1e',
);

const UNSUBSCRIBED_CSV = path.join(
    EXPORT_DIR,
    'unsubscribed_email_audience_export_fd09b24d1e.csv',
);
const CLEANED_CSV = path.join(
    EXPORT_DIR,
    'cleaned_email_audience_export_fd09b24d1e.csv',
);

// Minimal RFC4180 CSV parser (handles quoted fields, embedded commas/quotes).
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += c;
            }
        } else if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            row.push(field);
            field = '';
        } else if (c === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else if (c === '\r') {
            // skip, \n handles the row break
        } else {
            field += c;
        }
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows;
}

function readEmails(csvPath) {
    const text = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCsv(text);
    const header = rows[0];
    const emailIdx = header.indexOf('Email Address');
    if (emailIdx === -1) throw new Error(`No Email Address column in ${csvPath}`);
    return rows
        .slice(1)
        .map(r => (r[emailIdx] || '').trim().toLowerCase())
        .filter(Boolean);
}

async function unsubscribe(email) {
    if (DRY_RUN) {
        console.log(`[dry-run] would unsubscribe ${email}`);
        return { ok: true };
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(
            `https://api.resend.com/contacts/${encodeURIComponent(email)}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ unsubscribed: true }),
                signal: controller.signal,
            },
        );
        if (!res.ok) {
            const text = await res.text();
            return { ok: false, status: res.status, text };
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, status: 0, text: e instanceof Error ? e.message : String(e) };
    } finally {
        clearTimeout(timeout);
    }
}

async function main() {
    const unsubscribed = readEmails(UNSUBSCRIBED_CSV);
    const cleaned = readEmails(CLEANED_CSV);
    const all = [...new Set([...unsubscribed, ...cleaned])];

    console.log(
        `${unsubscribed.length} unsubscribed + ${cleaned.length} cleaned ` +
            `= ${all.length} unique emails to suppress`,
    );

    let succeeded = 0;
    let notFound = 0;
    let failed = 0;

    for (let i = 0; i < all.length; i++) {
        const email = all[i];
        const result = await unsubscribe(email);
        if (result.ok) {
            succeeded++;
        } else if (result.status === 404) {
            notFound++;
        } else {
            failed++;
            console.error(`Failed ${email}: ${result.status} ${result.text}`);
        }
        if ((i + 1) % 25 === 0) {
            console.log(`...${i + 1}/${all.length}`);
        }
        // Stay comfortably under Resend's rate limit.
        await new Promise(r => setTimeout(r, 120));
    }

    console.log(
        `Done. ${succeeded} suppressed, ${notFound} not found in Resend, ${failed} failed.`,
    );
}

main();
