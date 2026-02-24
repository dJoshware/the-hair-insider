"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Menu, ChevronDown } from "lucide-react";
import Image from "next/image";

export function Navbar() {
    const router = useRouter();
    const { signedIn, loading } = useAuth();
    const admin = useAdminStatus();
    const showAdmin = !admin.loading && admin.signedIn && admin.isAdmin;

    async function signOut() {
        await supabase.auth.signOut();
        router.push("/");
    }

    return (
        <header
            className='top-0 z-50 border-b bg-background'
            id='site-navbar'>
            <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
                <Link href='/'>
                    <Image
                        src='/thi_navbar_logo.svg'
                        alt='The Hair Insider'
                        height={1}
                        width={222}
                        style={{ marginLeft: -20, marginTop: 5 }}
                    />
                </Link>

                {/* Desktop dropdowns */}
                <div className='hidden md:flex items-center gap-3'>
                    {/* Explore dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                className='gap-1'>
                                Explore <ChevronDown className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align='end'
                            className='w-56'>
                            <DropdownMenuLabel>Explore THI</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href='/what-is-it'>What Is It?</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href='/inside-the-course'>
                                    Inside The Course
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href='/meet-your-educator'>
                                    Meet Your Educator
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <Link href='/about'>About</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href='/contact'>Contact Us</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href='/privacy'>Privacy Policy</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href='/terms'>Terms of Service</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Account dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                className='gap-1'>
                                Account <ChevronDown className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align='end'
                            className='w-56'>
                            {!loading && signedIn ? (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href='/account?tab=library'>
                                            Library
                                        </Link>
                                    </DropdownMenuItem>

                                    {showAdmin ? (
                                        <DropdownMenuItem asChild>
                                            <Link href='/admin/courses'>
                                                Admin
                                            </Link>
                                        </DropdownMenuItem>
                                    ) : null}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem onClick={signOut}>
                                        Sign out
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href='/signin'>Sign in</Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Primary CTA */}
                    <Button asChild>
                        <Link href='/courses'>View courses</Link>
                    </Button>
                </div>

                {/* Mobile hamburger menu */}
                <div className='flex items-center gap-3 md:hidden'>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant='ghost'
                                size='icon'
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
                                        <Link href='/what-is-it'>
                                            What Is It?
                                        </Link>
                                    </Button>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href='/inside-the-course'>
                                            Inside The Course
                                        </Link>
                                    </Button>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href='/meet-your-educator'>
                                            Meet Your Educator
                                        </Link>
                                    </Button>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href='/contact'>Contact Us</Link>
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
                                                <Link href='/account?tab=library'>
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

                                <div className='my-2 border-t' />

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href='/privacy'>Privacy</Link>
                                    </Button>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Button
                                        variant='ghost'
                                        asChild
                                        className='justify-start'>
                                        <Link href='/terms'>Terms</Link>
                                    </Button>
                                </SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
