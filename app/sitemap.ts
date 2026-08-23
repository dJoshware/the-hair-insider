import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    return [
        { url: `${siteUrl}/`, lastModified: new Date() },
        { url: `${siteUrl}/what-is-it`, lastModified: new Date() },
        { url: `${siteUrl}/inside-the-course`, lastModified: new Date() },
        { url: `${siteUrl}/meet-your-educator`, lastModified: new Date() },
        { url: `${siteUrl}/faq`, lastModified: new Date() },
        { url: `${siteUrl}/about`, lastModified: new Date() },
        { url: `${siteUrl}/support`, lastModified: new Date() },
        { url: `${siteUrl}/privacy`, lastModified: new Date() },
        { url: `${siteUrl}/terms`, lastModified: new Date() },
        { url: `${siteUrl}/7-day-moisture-reset`, lastModified: new Date() },
    ];
}
