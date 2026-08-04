import type { Metadata } from "next";
// import Script from "next/script";
import ExternalReturnReload from "./_components/ExternalReturnReload";
import { Bodoni_Moda, Luxurious_Script } from "next/font/google";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
    variable: "--font-bodoni-moda",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
});

const luxuriousScript = Luxurious_Script({
    variable: "--font-luxurious-script",
    subsets: ["latin"],
    weight: "400",
});

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-hair-insider.com";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "The Hair Insider: Hair Care Education & Routines",
        template: "%s | The Hair Insider",
    },
    description:
        "Education-first hair care. Learn what your hair actually needs, build a simple routine, and understand the science behind healthy hair growth.",
    keywords: [
        "the hair insider",
        "hair insider",
        "hair care",
        "hair care routine",
        "hair care education",
        "healthy hair",
        "hair growth",
        "natural hair",
        "hair moisture",
        "hair type",
        "hair science",
        "hair course",
    ],
    authors: [{ name: "The Hair Insider", url: siteUrl }],
    creator: "The Hair Insider",
    publisher: "The Hair Insider",
    applicationName: "The Hair Insider",
    alternates: { canonical: siteUrl },
    icons: {
        icon: [{ url: "/favicon.ico" }],
        apple: [{ url: "/apple-touch-icon.png" }],
    },
    openGraph: {
        title: "The Hair Insider: Hair Care Education & Routines",
        description:
            "Education-first hair care. Learn what your hair actually needs, build a simple routine, and understand the science behind healthy hair growth.",
        siteName: "The Hair Insider",
        url: siteUrl,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Hair Insider: Hair Care Education & Routines",
        description:
            "Education-first hair care. Learn what your hair actually needs, build a simple routine, and understand the science behind healthy hair growth.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang='en'
            className={`
                ${bodoniModa.variable}
                ${luxuriousScript.variable}
            `}
            suppressHydrationWarning>
            <head>
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "EducationalOrganization",
                            name: "The Hair Insider",
                            description:
                                "Education-first hair care. Simple routines, clear guidance, and science-backed hair care knowledge.",
                            url: siteUrl,
                            keywords:
                                "the hair insider, hair insider, hair care, hair care routine, healthy hair, hair growth, natural hair, hair moisture",
                        }),
                    }}
                />
                {/* Mailchimp popup-form connector, disabled during Resend migration.
                <script
                    id='mcjs'
                    dangerouslySetInnerHTML={{
                        __html: `!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/115024abbbe42dfa2d699bd2f/fc03026f639a875a05b88dc5c.js");`,
                    }}
                /> */}
            </head>
            <body
                className={`
                antialiased
                ${bodoniModa.className}
            `}>
                <ExternalReturnReload />
                {children}
            </body>
        </html>
    );
}
