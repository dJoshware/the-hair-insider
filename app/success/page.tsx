import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
    return (
        <div className='mx-auto max-w-2xl px-6 py-20'>
            <h1 className='text-3xl font-semibold tracking-tight'>
                You’re in.
            </h1>
            <p className='mt-3 text-muted-foreground'>
                Your access is being activated. If it takes a moment, refresh
                your library.
            </p>
            <div className='mt-8 flex gap-3'>
                <Button asChild>
                    <Link href='/library'>Go to library</Link>
                </Button>
                <Button
                    asChild
                    variant='outline'>
                    <Link href='/courses'>Back to courses</Link>
                </Button>
            </div>
        </div>
    );
}
