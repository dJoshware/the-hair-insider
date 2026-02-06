import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
    return (
        <header className='sticky top-0 z-50 border-b bg-background/80 backdrop-blur'>
            <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
                {/* Brand */}
                <Link
                    href='/'
                    className='text-base font-semibold tracking-tight'>
                    Hair Insider
                </Link>

                {/* Navigation */}
                <NavigationMenu className='hidden md:flex'>
                    <NavigationMenuList className='gap-6'>
                        <NavigationMenuItem>
                            <Link
                                href='#what'
                                passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                                    )}>
                                    What it is
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link
                                href='#how'
                                passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                                    )}>
                                    How it works
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Link
                                href='#stylist'
                                passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                                    )}>
                                    Meet your stylist
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Actions */}
                <div className='flex items-center gap-3'>
                    <Button
                        variant='ghost'
                        asChild
                        className='hidden sm:inline-flex'>
                        <Link href='/signin'>Sign in</Link>
                    </Button>
                    <Button asChild>
                        <Link href='/pricing'>View course</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
