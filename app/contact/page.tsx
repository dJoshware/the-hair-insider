"use client";

import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FadeIn } from "@/components/site/FadeIn";
import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "@/components/site/ContactForm";

export default function ContactPage() {
    const { ref: pageRef, inView: pageIn } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            {/* Fixed background and overlay layer */}
            <Overlay />

            {/* Main content */}
            <Navbar />

            <main
                ref={pageRef}
                className='mx-auto flex max-w-6xl flex-col items-center px-6 py-14 sm:py-20'>
                <FadeIn
                    inView={pageIn}
                    delayMs={100}>
                    <div className='w-full max-w-md'>
                        <Card className='rounded-3xl'>
                            <CardHeader>
                                <CardTitle className='text-2xl'>
                                    Contact Us
                                </CardTitle>
                                <CardDescription>
                                    Send a message and we’ll get back to you by
                                    email.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className='space-y-6'>
                                <ContactForm />

                                <div className='text-sm'>
                                    <p className='mt-2 leading-6'>
                                        Prefer to browse first?{" "}
                                        <Link
                                            href='/courses'
                                            className='font-medium text-foreground underline underline-offset-4'>
                                            View courses
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </FadeIn>
            </main>
        </div>
    );
}
