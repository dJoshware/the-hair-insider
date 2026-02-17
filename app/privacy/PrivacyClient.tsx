import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyClient() {
    const lastUpdated = "February 17, 2026";

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main className='mx-auto max-w-4xl px-6 pt-8 pb-16'>
                <div className='space-y-6'>
                    <div>
                        <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                            Privacy Policy
                        </h1>
                        <p className='mt-2 text-sm'>
                            Last updated: {lastUpdated}
                        </p>
                    </div>

                    <p className='text-base leading-7'>
                        This Privacy Policy explains how The Hair Insider
                        collects, uses, and protects your information when you
                        use our website and services.
                    </p>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Information we collect
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    Account information: email address and basic
                                    authentication identifiers used to sign you
                                    in.
                                </li>
                                <li>
                                    Purchase information: limited purchase
                                    metadata needed to provide access (for
                                    example, transaction identifiers).
                                </li>
                                <li>
                                    Contact submissions: details you submit via
                                    our contact form.
                                </li>
                                <li>
                                    Usage data: basic analytics and logs used
                                    for security and performance (for example,
                                    IP address, device information, pages
                                    visited).
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                How we use information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    To create and maintain your account and
                                    library access.
                                </li>
                                <li>To process payments and prevent fraud.</li>
                                <li>
                                    To respond to messages and support requests.
                                </li>
                                <li>
                                    To improve the site, troubleshoot, and keep
                                    it secure.
                                </li>
                                <li>
                                    To comply with legal and regulatory
                                    requirements.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Payments and third parties
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                Payments are processed by third-party payment
                                processors (for example, Stripe). We do not
                                store your full payment card details on our
                                servers. These providers may collect and process
                                information according to their own privacy
                                policies.
                            </p>
                            <p>
                                We may use service providers for hosting, email
                                delivery, and analytics. We share only what is
                                reasonably necessary for them to perform their
                                services.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>Cookies</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                We may use cookies or similar technologies for
                                authentication, security, and site
                                functionality. You can control cookies through
                                your browser settings. Some features may not
                                work properly if you disable cookies.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Data retention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                We keep personal information only as long as
                                needed to provide services, comply with legal
                                obligations, resolve disputes, and enforce
                                agreements.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Your choices
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    You can request access to, correction of, or
                                    deletion of your data.
                                </li>
                                <li>
                                    You can opt out of non-essential marketing
                                    emails if we send them.
                                </li>
                                <li>
                                    You can control cookies in your browser.
                                </li>
                            </ul>
                            <p>
                                For requests,{" "}
                                <a
                                    href='/contact'
                                    className='underline font-bold'>
                                    contact us
                                </a>
                                . We may need to verify your identity before
                                fulfilling certain requests.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Children
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                The Hair Insider is not intended for children
                                under 13. If you believe a child has provided
                                personal information, contact us so we can
                                delete it.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>Changes</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                We may update this policy from time to time. The
                                “Last updated” date will reflect the most recent
                                version.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
