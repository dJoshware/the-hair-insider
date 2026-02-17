import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    return [
        { url: `${siteUrl}/`, lastModified: new Date() },
        { url: `${siteUrl}/courses`, lastModified: new Date() },
        { url: `${siteUrl}/contact`, lastModified: new Date() },
        { url: `${siteUrl}/privacy`, lastModified: new Date() },
        { url: `${siteUrl}/terms`, lastModified: new Date() },
    ];
}
