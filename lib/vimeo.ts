import 'server-only';

/**
 * Extract numeric Vimeo video ID from:
 * - "123456789"
 * - "https://vimeo.com/123456789"
 * - "https://player.vimeo.com/video/123456789"
 * - "https://vimeo.com/manage/videos/123456789"
 * - private-link URLs like "https://vimeo.com/123456789/abcdef"
 */
export function extractVideoId(input: string): string | null {
    const raw = (input || '').trim();
    if (!raw) return null;

    if (/^\d+$/.test(raw)) return raw;

    try {
        const url = new URL(raw);

        // player.vimeo.com/video/<id>
        const playerMatch = url.pathname.match(/\/video\/(\d+)/);
        if (playerMatch?.[1]) return playerMatch[1];

        // vimeo.com/<id> or vimeo.com/manage/videos/<id> or vimeo.com/<id>/<hash>
        const pathMatch = url.pathname.match(/\/(\d+)(?:$|\/)/);
        if (pathMatch?.[1]) return pathMatch[1];

        return null;
    } catch {
        const anyMatch = raw.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
        return anyMatch?.[1] ?? null;
    }
}

/**
 * Extract the "h" privacy hash from:
 * - https://player.vimeo.com/video/<id>?h=<hash>
 * - https://vimeo.com/<id>/<hash>
 */
export function extractVimeoHash(input: string): string | null {
    const raw = (input || '').trim();
    if (!raw) return null;

    try {
        const url = new URL(raw);

        // If already in player format with ?h=
        const h = url.searchParams.get('h');
        if (h) return h;

        // vimeo.com/<id>/<hash>
        const privateMatch = url.pathname.match(/^\/\d+\/([a-zA-Z0-9]+)\/?$/);
        if (privateMatch?.[1]) return privateMatch[1];

        return null;
    } catch {
        const m = raw.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/);
        return m?.[1] ?? null;
    }
}

/**
 * Normalize anything the admin pastes into a reliable embeddable URL.
 * Preserves the privacy hash when present.
 */
export function normalizeVimeoEmbedUrl(input: string): string {
    const raw = (input || '').trim();
    if (!raw) return raw;

    const id = extractVideoId(raw);
    if (!id) return raw;

    const hash = extractVimeoHash(raw);
    return hash
        ? `https://player.vimeo.com/video/${id}?h=${hash}`
        : `https://player.vimeo.com/video/${id}`;
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
