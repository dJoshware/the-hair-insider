export function OrgJsonLd() {
    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-hair-insider.com";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "The Hair Insider",
        url: siteUrl,
        logo: `${siteUrl}/thi_navbar_logo.svg`,
        // Add real socials when ready:
        sameAs: [
            "https://www.instagram.com/thehairinsider",
            // "https://www.youtube.com/@yourhandle",
            "https://www.tiktok.com/@thehairinsider",
        ],
    };

    return (
        <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
