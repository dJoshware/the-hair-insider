// One-off backfill: the CSV import brought contacts in with a dead flattened
// "tags" string property, but nothing set the real per-purchase/sequence
// properties the new Resend Automation actually checks. This reads the
// original Mailchimp CSVs directly (source of truth) and sets those
// properties on each matching contact.
//
// Mapping (per user confirmation):
//   lead-completed                  -> welcome_finished: "true"
//   growth-mini-course-purchased    -> growth_mini_course_purchased: "true"
//   growth-bundle-purchased         -> growth_bundle_purchased: "true"
//   growth-workbook-purchased       -> growth_workbook_purchased: "true"
//   growth-edit-purchased           -> growth_edit_purchased: "true"
//   lead-magnet                     -> no longer exists, not mapped
//
// Cleaned (bounced) contacts are skipped entirely -- already suppressed,
// sequence state on a dead address is meaningless.
//
// Usage: RESEND_API_KEY=... node scripts/backfill-resend-properties.cjs [--dry-run]

const fs = require('fs');
const path = require('path');
const os = require('os');

const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) {
    console.error('Missing RESEND_API_KEY');
    process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

const EXPORT_DIR = path.join(os.homedir(), 'Downloads', 'audience_export_5753690843');
const SUBSCRIBED_CSV = path.join(EXPORT_DIR, 'subscribed_email_audience_export_5753690843.csv');
const UNSUBSCRIBED_CSV = path.join(EXPORT_DIR, 'unsubscribed_email_audience_export_5753690843.csv');

const TAG_TO_PROPERTY = {
    'lead-completed': 'welcome_finished',
    'growth-mini-course-purchased': 'growth_mini_course_purchased',
    'growth-bundle-purchased': 'growth_bundle_purchased',
    'growth-workbook-purchased': 'growth_workbook_purchased',
    'growth-edit-purchased': 'growth_edit_purchased',
};

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

function parseTags(rawField) {
    if (!rawField) return [];
    return rawField
        .split(',')
        .map(t => t.replace(/"/g, '').trim())
        .filter(Boolean);
}

function readRows(csvPath) {
    const text = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCsv(text);
    const header = rows[0];
    const emailIdx = header.indexOf('Email Address');
    const tagsIdx = header.indexOf('TAGS');
    if (emailIdx === -1 || tagsIdx === -1) {
        throw new Error(`Missing expected columns in ${csvPath}`);
    }
    return rows
        .slice(1)
        .map(r => ({
            email: (r[emailIdx] || '').trim().toLowerCase(),
            tags: parseTags(r[tagsIdx] || ''),
        }))
        .filter(r => r.email);
}

async function updateContactProperties(email, properties) {
    if (DRY_RUN) {
        console.log(`[dry-run] would update ${email}:`, properties);
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
                body: JSON.stringify({ properties }),
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
    const subscribed = readRows(SUBSCRIBED_CSV);
    const unsubscribed = readRows(UNSUBSCRIBED_CSV);
    const all = [...subscribed, ...unsubscribed];

    console.log(
        `${subscribed.length} subscribed + ${unsubscribed.length} unsubscribed ` +
            `= ${all.length} rows to check`,
    );

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let notFound = 0;

    for (let i = 0; i < all.length; i++) {
        const { email, tags } = all[i];
        const properties = {};
        for (const tag of tags) {
            const prop = TAG_TO_PROPERTY[tag];
            if (prop) properties[prop] = 'true';
        }

        if (Object.keys(properties).length === 0) {
            skipped++;
            continue;
        }

        const result = await updateContactProperties(email, properties);
        if (result.ok) {
            updated++;
        } else if (result.status === 404) {
            notFound++;
        } else {
            failed++;
            console.error(`Failed ${email}: ${result.status} ${result.text}`);
        }

        if ((i + 1) % 100 === 0) {
            console.log(`...${i + 1}/${all.length}`);
        }
        // Stay comfortably under Resend's rate limit.
        await new Promise(r => setTimeout(r, 120));
    }

    console.log(
        `Done. ${updated} updated, ${skipped} skipped (no mapped tags), ` +
            `${notFound} not found, ${failed} failed.`,
    );
}

main();
