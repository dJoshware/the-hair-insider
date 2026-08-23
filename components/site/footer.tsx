import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { TikTokIcon, YouTubeIcon, InstagramIcon } from "@/components/site/SocialIcons";

const SITE_LINKS = [
    { href: "/what-is-it", label: "What Is It?" },
    { href: "/inside-the-course", label: "Inside The Course" },
    { href: "/meet-your-educator", label: "Meet Your Educator" },
    { href: "/#shop", label: "Shop" },
    { href: "/faq", label: "FAQ" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
];

const LEGAL_LINKS = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
];

const SOCIAL_LINKS = [
    { href: "https://instagram.com/thehairinsider", label: "Instagram", Icon: InstagramIcon },
    { href: "https://www.youtube.com/@TheHairInsider", label: "YouTube", Icon: YouTubeIcon },
    { href: "https://www.tiktok.com/@lifewith.laurenj", label: "@lifewith.laurenj", Icon: TikTokIcon },
    { href: "https://www.tiktok.com/@thehairinsider", label: "@thehairinsider", Icon: TikTokIcon },
];

export function Footer() {
    return (
        <footer
            className='mt-16 text-foreground bg-background/50'
            id='site-footer'>
            <Separator />

            <div className='mx-auto max-w-6xl px-6 py-12'>
                <div className='grid gap-10 text-center sm:text-left sm:grid-cols-2 lg:grid-cols-4'>
                    {/* Brand */}
                    <div className='space-y-4 lg:col-span-2'>
                        <Link
                            href='/'
                            className='bg-secondary rounded-3xl h-20 px-10 pt-2 inline-flex items-center gap-3'>
                            <Image
                                src='/thi_navbar_logo.svg'
                                alt='The Hair Insider'
                                width={222}
                                height={1}
                                priority={false}
                            />
                        </Link>

                        <p className='max-w-md text-sm leading-6'>
                            Education-first hair care. Simple routines, clear
                            guidance, and a calm library experience.
                        </p>
                    </div>

                    {/* Site links */}
                    <div className='space-y-3'>
                        <p className='text-md font-semibold tracking-wide'>
                            Site
                        </p>
                        <ul className='space-y-2 text-sm'>
                            {SITE_LINKS.map(l => (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        className='hover:text-foreground transition-colors'>
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social + Legal */}
                    <div className='space-y-6'>
                        <div className='space-y-3'>
                            <p className='text-md font-semibold tracking-wide'>
                                Social
                            </p>
                            <ul className='space-y-2 text-sm'>
                                {SOCIAL_LINKS.map(s => (
                                    <li key={s.label}>
                                        <a
                                            href={s.href}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='inline-flex items-center gap-1.5 hover:text-foreground transition-colors'>
                                            <s.Icon className='h-3.5 w-3.5 shrink-0' />
                                            {s.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className='space-y-3'>
                            <p className='text-md font-semibold tracking-wide'>
                                Legal
                            </p>
                            <ul className='space-y-2 text-sm'>
                                {LEGAL_LINKS.map(l => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className='hover:text-foreground transition-colors'>
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <Separator className='my-8' />

                <div className='flex flex-col gap-3 sm:flex-row items-center sm:justify-between'>
                    <p className='text-xs'>
                        © {new Date().getFullYear()} The Hair Insider. All
                        rights reserved.
                    </p>

                    <p className='text-xs'>Built with calm, not chaos.</p>
                </div>
            </div>
        </footer>
    );
}
