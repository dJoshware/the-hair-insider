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
import { ContactForm } from "@/components/site/ContactForm";

export function ContactDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='ghost'>Contact</Button>
            </DialogTrigger>

            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Contact</DialogTitle>
                </DialogHeader>
                <ContactForm inDialog />
            </DialogContent>
        </Dialog>
    );
}
