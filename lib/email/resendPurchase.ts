import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Matches the contact properties the "Welcome Hair Insider!" Resend
// Automation checks to exit the welcome sequence early on purchase.
export const SLUG_TO_RESEND_PROPERTY: Record<string, string> = {
    'hair-growth-foundations-mini-course': 'growth_mini_course_purchased',
    'hair-growth-bundle': 'growth_bundle_purchased',
    'hair-growth-workbook': 'growth_workbook_purchased',
    'hair-growth-edit': 'growth_edit_purchased',
};

export async function markResendPurchase(email: string, property: string) {
    try {
        await resend.contacts.update({
            email: email.trim().toLowerCase(),
            properties: { [property]: 'true' },
        });
    } catch (e) {
        console.error('Resend contact purchase property update failed:', e);
    }
}
