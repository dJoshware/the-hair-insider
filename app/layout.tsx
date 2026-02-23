import type { Metadata } from "next";
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
        default: "The Hair Insider",
        template: "%s | The Hair Insider",
    },
    description:
        "Education-first hair care. Simple routines, clear guidance, and a calm library experience.",
    icons: {
        icon: [{ url: "/favicon.ico" }],
        apple: [{ url: "/apple-touch-icon.png" }],
    },
    openGraph: {
        title: "The Hair Insider",
        description:
            "Education-first hair care. Simple routines, clear guidance, and a calm library experience.",
        siteName: "The Hair Insider",
        type: "website",
    },
    // optional baseline
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
