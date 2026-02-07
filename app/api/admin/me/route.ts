import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/admin/requireAdmin';

export async function GET(req: Request) {
    const res = await requireAdminFromRequest(req);
    if (!res.ok) {
        return NextResponse.json(
            { isAdmin: false, error: res.error },
            { status: res.status },
        );
    }
    return NextResponse.json({ isAdmin: true, email: res.email });
}
