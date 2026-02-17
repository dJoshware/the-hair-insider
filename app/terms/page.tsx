import type { Metadata } from "next";
import Link from "next/link";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Terms of Service | The Hair Insider",
    description:
        "Terms of Service for The Hair Insider. Education-only content, acceptable use, payments, and limitations of liability.",
};

export default function TermsPage() {
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
                            Terms of Service
                        </h1>
                        <p className='mt-2 text-sm'>
                            Last updated: {lastUpdated}
                        </p>
                    </div>

                    <p className='text-base leading-7'>
                        By accessing or using The Hair Insider website, courses,
                        and services, you agree to these Terms. If you do not
                        agree, do not use the site.
                    </p>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Education only, not medical advice
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                The Hair Insider provides educational
                                information about hair routines, products, and
                                general hair care concepts. We do not provide
                                medical advice, diagnosis, or treatment. Always
                                consult a licensed healthcare provider for
                                medical questions or conditions.
                            </p>
                            <p>
                                Results vary. Any examples, routines, or
                                guidance are general education and are not
                                guarantees.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Assumption of risk and safety
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                Hair care can involve chemical products, heat
                                tools, and techniques that may cause irritation,
                                allergic reactions, hair damage, or other harm
                                if used incorrectly or if you are sensitive. You
                                are responsible for your choices and actions.
                            </p>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    Follow product labels and manufacturer
                                    instructions.
                                </li>
                                <li>Patch test when recommended.</li>
                                <li>
                                    Use appropriate protective equipment when
                                    applicable.
                                </li>
                                <li>
                                    Stop use if you experience irritation or
                                    adverse effects.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Accounts and access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                You are responsible for maintaining the
                                confidentiality of your account access. Do not
                                share login links or credentials. We may suspend
                                or terminate access for abuse, fraud, or
                                unauthorized sharing.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Purchases, refunds, and access revocation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                Because The Hair Insider provides immediate
                                access to digital content,{" "}
                                <strong>all sales are final</strong> unless
                                otherwise stated below or required by law.
                            </p>
                            <p>
                                We offer a 7-day refund window from the date of
                                purchase for first-time purchases when:
                            </p>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    the request is made from the email used at
                                    checkout, and
                                </li>
                                <li>
                                    the content has not been substantially
                                    consumed, and
                                </li>
                                <li>
                                    we determine the request is made in good
                                    faith.
                                </li>
                            </ul>
                            <p>
                                If a refund is approved,{" "}
                                <strong>access will be revoked</strong> and your
                                library will be deactivated for the refunded
                                product(s).
                            </p>
                            <p>
                                We reserve the right to deny refund requests in
                                cases of suspected abuse, excessive usage, or
                                repeated refund activity.
                            </p>
                            <p>
                                To request a refund,{" "}
                                <a
                                    href='/contact'
                                    className='underline font-bold'>
                                    contact us
                                </a>{" "}
                                with your order email and the product name.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Acceptable use
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    Do not attempt to access restricted areas
                                    without authorization.
                                </li>
                                <li>
                                    Do not scrape, reverse engineer, or disrupt
                                    the site.
                                </li>
                                <li>
                                    Do not use the site for unlawful, harmful,
                                    or abusive activity.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Intellectual property
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                All course content, downloads, and materials are
                                owned by The Hair Insider or its licensors. You
                                may not copy, redistribute, resell, or publish
                                course materials without written permission.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Disclaimers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                The site and services are provided “as is” and
                                “as available.” We do not warrant that the site
                                will be uninterrupted, error free, or that
                                outcomes will meet your expectations.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Limitation of liability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                To the maximum extent permitted by law, The Hair
                                Insider and its owners, contractors, and
                                partners will not be liable for any indirect,
                                incidental, special, consequential, or punitive
                                damages, or for any hair or scalp outcomes
                                related to use of the information, products, or
                                techniques discussed.
                            </p>
                            <p>
                                In any case, our total liability for any claim
                                will not exceed the amount you paid to us for
                                the specific product or service at issue.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                Changes to these terms
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <p>
                                We may update these Terms from time to time.
                                Continued use of the site after updates means
                                you accept the updated Terms.
                            </p>
                            <p>
                                Questions?{" "}
                                <Link
                                    href='/contact'
                                    className='font-medium text-foreground underline underline-offset-4'>
                                    Contact us
                                </Link>
                                .
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
