import Link from "next/link";
import type { Metadata } from "next";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import { SiteBreadcrumbs } from "@/components/site/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "About | The Hair Insider",
    description:
        "The Hair Insider is an education-first hair care course library focused on simple routines, clear guidance, and practical decisions.",
};

export default function AboutPage() {
    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />
            <SiteBreadcrumbs />

            <main className='mx-auto max-w-4xl px-6 pt-8 pb-16'>
                <div className='space-y-6'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <Badge variant='secondary'>Education-first</Badge>
                        <Badge variant='secondary'>Routine-based</Badge>
                        <Badge variant='secondary'>Practical guidance</Badge>
                    </div>

                    <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
                        About The Hair Insider
                    </h1>

                    <p className='text-base leading-7'>
                        The Hair Insider is a course-driven education library
                        designed to help you stop guessing and build a hair
                        routine you can actually stick to. We focus on why hair
                        behaves the way it does, what common issues usually
                        mean, and how to make smarter routine decisions over
                        time.
                    </p>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                What we help with
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    Understanding your hair and scalp signals.
                                </li>
                                <li>
                                    Building a simple weekly routine that
                                    protects length.
                                </li>
                                <li>
                                    Reducing trial-and-error and product
                                    overload.
                                </li>
                                <li>
                                    Learning safer decision-making around tools
                                    and products.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-base'>
                                What we are not
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <ul className='list-disc pl-5 space-y-2'>
                                <li>
                                    Medical advice, diagnosis, or treatment.
                                </li>
                                <li>
                                    A substitute for a licensed professional
                                    in-person evaluation.
                                </li>
                                <li>
                                    A guarantee of specific results for every
                                    person.
                                </li>
                            </ul>
                            <p>
                                If you have scalp pain, bleeding, infection,
                                sudden shedding, allergic reactions, or a
                                medical condition, consult a licensed healthcare
                                provider or dermatologist.
                            </p>
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className='space-y-3'>
                        <h2 className='text-xl font-semibold tracking-tight'>
                            Safety comes first
                        </h2>
                        <p className='text-sm leading-6'>
                            Hair and scalp care can involve chemical products,
                            heat tools, and techniques that carry risk if used
                            incorrectly. Always follow the product label, do
                            patch tests when recommended, use protective
                            equipment when appropriate, and stop if you
                            experience irritation or adverse effects.
                        </p>
                    </div>

                    <div className='pt-2 text-sm'>
                        <p>
                            Need help?{" "}
                            <Link
                                href='/contact'
                                className='font-medium text-foreground underline underline-offset-4'>
                                Contact us
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
