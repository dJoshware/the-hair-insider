"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SupportForm } from "@/components/site/SupportForm";

export function SupportDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='ghost'>Support</Button>
            </DialogTrigger>

            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Support</DialogTitle>
                </DialogHeader>
                <SupportForm inDialog />
            </DialogContent>
        </Dialog>
    );
}
