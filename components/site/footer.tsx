import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className='mt-16'>
            <Separator />
            <div className='mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row items-center justify-between'>
                <p className='text-sm text-muted-foreground'>
                    © {new Date().getFullYear()} Hair Insider. All rights
                    reserved.
                </p>
                <div className='flex gap-6 text-sm text-muted-foreground'>
                    <Link
                        href='/pricing'
                        className='hover:text-foreground'>
                        Pricing
                    </Link>
                    <Link
                        href='/signin'
                        className='hover:text-foreground'>
                        Sign in
                    </Link>
                    <Link
                        href='/library'
                        className='hover:text-foreground'>
                        Library
                    </Link>
                </div>
            </div>
        </footer>
    );
}
