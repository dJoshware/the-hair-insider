"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { supabase } from "@/lib/supabase/client";
import { useAdminStatus } from "@/lib/admin/useAdminStatus";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";

export function Navbar() {
    const { signedIn, loading } = useAuth();
    const admin = useAdminStatus();
    const showAdmin = !admin.loading && admin.signedIn && admin.isAdmin;

    const pathname = usePathname();
    const onHome = pathname === "/";

    async function signOut() {
        await supabase.auth.signOut();
    }

    // Use /#hash on home, and /?scroll=... on other pages (optional)
    const hashHref = (hash: string) => (onHome ? `/#${hash}` : `/#${hash}`);

    return (
        <header className='sticky top-0 z-50 border-b bg-background'>
            <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
                <Link
                    href='/'>
                    <Image
                        src="/thi_navbar_logo.svg"
                        alt="The Hair Insider logo"
                        height={1}
                        width={222}
                        style={{
                            marginLeft: -20,
                            marginTop: 5,
                        }}
                    />
                </Link>

                {/* Desktop anchors */}
                <NavigationMenu className='hidden md:flex'>
                    <NavigationMenuList className='gap-6'>
                        <NavigationMenuItem>
                            <Link
                                href={hashHref("hero")}
                                passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-foreground",
                                    )}>
                                    Start here
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link
                                href={hashHref("what")}
                                passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-foreground",
                                    )}>
                                    What it is
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link
                                href={hashHref("how")}
                                passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-foreground",
                                    )}>
                                    How it works
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link
                                href={hashHref("stylist")}
                                passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-foreground",
                                    )}>
                                    Meet your stylist
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className='flex items-center gap-3'>
                    {/* Desktop auth links */}
                    {!loading && signedIn ? (
                        <>
                            <Button
                                variant='ghost'
                                asChild
                                className='hidden sm:inline-flex'>
                                <Link href='/library'>Library</Link>
                            </Button>

                            {showAdmin ? (
                                <Button
                                    variant='ghost'
                                    asChild
                                    className='hidden sm:inline-flex'>
                                    <Link href='/admin/courses'>Admin</Link>
                                </Button>
                            ) : null}

                            <Button
                                variant='ghost'
                                onClick={signOut}
                                className='hidden sm:inline-flex'>
                                Sign out
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant='ghost'
                            asChild
                            className='hidden sm:inline-flex'>
                            <Link href='/signin'>Sign in</Link>
                        </Button>
                    )}

                    <Button
                        asChild
                        className='hidden sm:inline-flex'>
                        <Link href='/courses'>View courses</Link>
                    </Button>

                    {/* Mobile hamburger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='sm:hidden'
                                aria-label='Open menu'>
                                <Menu className='h-5 w-5' />
                            </Button>
                        </SheetTrigger>

                        <SheetContent
                            side='right'
                            className='w-[320px] sm:w-[360px] font-bodoni'>
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>

                            <div className='mt-6 flex flex-col gap-2'>
                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href={hashHref("hero")}>
                                            Start here
                                        </Link>
                                    </Button>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href={hashHref("what")}>
                                            What it is
                                        </Link>
                                    </Button>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href={hashHref("how")}>
                                            How it works
                                        </Link>
                                    </Button>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href={hashHref("stylist")}>
                                            Meet your stylist
                                        </Link>
                                    </Button>
                                </SheetClose>

                                <div className='my-2 border-t' />

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href='/courses'>
                                            View courses
                                        </Link>
                                    </Button>
                                </SheetClose>

                                {!loading && signedIn ? (
                                    <>
                                        <SheetClose asChild>
                                            <Button
                                                variant='ghost'
                                                asChild
                                                className='justify-start'>
                                                <Link href='/library'>
                                                    Library
                                                </Link>
                                            </Button>
                                        </SheetClose>

                                        {showAdmin ? (
                                            <SheetClose asChild>
                                                <Button
                                                    variant='ghost'
                                                    asChild
                                                    className='justify-start'>
                                                    <Link href='/admin/courses'>
                                                        Admin
                                                    </Link>
                                                </Button>
                                            </SheetClose>
                                        ) : null}

                                        <Button
                                            variant='ghost'
                                            className='justify-start'
                                            onClick={async () => {
                                                await signOut();
                                            }}>
                                            Sign out
                                        </Button>
                                    </>
                                ) : (
                                    <SheetClose asChild>
                                        <Button
                                            variant='ghost'
                                            asChild
                                            className='justify-start'>
                                            <Link href='/signin'>Sign in</Link>
                                        </Button>
                                    </SheetClose>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
