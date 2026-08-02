import { NextResponse } from 'next/server';
import { runDueWelcomeSequenceBatch } from '@/lib/email/welcomeSequence';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await runDueWelcomeSequenceBatch();
    return NextResponse.json(results);
}
