import { Overlay } from "@/components/site/Overlay";
import { Navbar } from "@/components/site/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function UnsubscribedPage() {
    return (
        <div className='relative min-h-[100dvh] text-foreground'>
            <Overlay />
            <Navbar />

            <main className='mx-auto flex max-w-6xl flex-col items-center px-6 py-14 sm:py-20'>
                <div className='w-[350px] max-w-md'>
                    <Card className='rounded-3xl'>
                        <CardHeader>
                            <CardTitle className='text-2xl'>
                                You&apos;re unsubscribed.
                            </CardTitle>
                            <CardDescription>
                                You won&apos;t receive any more emails from
                                this sequence. If that was a mistake, just
                                sign up again on the site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent />
                    </Card>
                </div>
            </main>
        </div>
    );
}
