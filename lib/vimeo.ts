import 'server-only';

/**
 * Accepts:
 * - "123456789"
 * - "https://vimeo.com/123456789"
 * - "https://player.vimeo.com/video/123456789"
 * - "https://vimeo.com/manage/videos/123456789"
 * - URLs with query params like "?h=abc"
 */
export function extractVideoId(input: string): string | null {
    const raw = (input || '').trim();
    if (!raw) return null;

    // If they already stored a plain numeric ID
    if (/^\d+$/.test(raw)) return raw;

    // Try URL parse first
    try {
        const url = new URL(raw);

        // Common: player.vimeo.com/video/<id>
        const playerMatch = url.pathname.match(/\/video\/(\d+)/);
        if (playerMatch?.[1]) return playerMatch[1];

        // Common: vimeo.com/<id> or vimeo.com/manage/videos/<id>
        const pathMatch = url.pathname.match(/\/(\d+)(?:$|\/)/);
        if (pathMatch?.[1]) return pathMatch[1];

        return null;
    } catch {
        // Not a valid URL, fall back to regex scan
        const anyMatch = raw.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
        return anyMatch?.[1] ?? null;
    }
}

export async function getVimeoVideoDurationSeconds(videoId: string) {
    const token = process.env.VIMEO_ACCESS_TOKEN;
    if (!token) throw new Error('Missing VIMEO_ACCESS_TOKEN');

    const res = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Vimeo error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as { duration?: number };
    return json.duration ?? null; // seconds
}
