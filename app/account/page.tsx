import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
    title: "Account",
    description: "Manage your account and access your library.",
    robots: { index: false, follow: false },
};

export default function AccountPage() {
    return <AccountClient />;
}
