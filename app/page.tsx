import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
    title: "The Hair Insider",
    description:
        "Education-first hair care that teaches what your hair actually needs, why it feels like it won’t grow, and how to build a simple routine you can stick to.",
};

export default function Home() {
    return <HomeClient />;
}
