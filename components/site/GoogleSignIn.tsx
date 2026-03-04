"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function GoogleGIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox='0 0 48 48'
            aria-hidden='true'
            focusable='false'
            {...props}>
            <path
                fill='#FFC107'
                d='M43.611 20.083H42V20H24v8h11.303C33.915 32.657 29.303 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.968 6.053 29.725 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z'
            />
            <path
                fill='#FF3D00'
                d='M6.306 14.691l6.571 4.819C14.655 16.108 19.013 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.968 6.053 29.725 4 24 4c-7.682 0-14.356 4.327-17.694 10.691z'
            />
            <path
                fill='#4CAF50'
                d='M24 44c5.19 0 10.047-1.986 13.63-5.217l-6.29-5.321C29.303 35.657 26.773 36 24 36c-5.281 0-9.876-3.321-11.297-7.946l-6.52 5.022C9.47 39.556 16.227 44 24 44z'
            />
            <path
                fill='#1976D2'
                d='M43.611 20.083H42V20H24v8h11.303c-.681 1.986-1.968 3.657-3.663 4.783l.003-.002 6.29 5.321C36.5 39.5 44 34 44 24c0-1.341-.138-2.651-.389-3.917z'
            />
        </svg>
    );
}

export function GoogleSignInButton() {
    const onGoogle = async () => {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next") || "/dashboard";

        try {
            localStorage.setItem("postAuthRedirect", next);
        } catch {}

        const origin = window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) {
            console.error(error);
            alert("Google sign-in failed. Please try again.");
        }
    };

    return (
        <Button
            type='button'
            variant='default'
            className='h-12 w-full rounded-2xl'
            onClick={onGoogle}>
            <GoogleGIcon className='mr-2 h-5 w-5' />
            Continue with Google
        </Button>
    );
}
