import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

// Same story as sign-in: v6 dropped NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL, so a new
// account used to be dropped on the landing page with no sign of being signed in.
const AFTER_SIGN_UP = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/tone-match";

/**
 * Its own title and a noindex.
 *
 * Without this the page inherited the root layout's metadata, which meant the
 * auth screen shared the homepage's title and, worse, carried
 * `<link rel="canonical" href="https://tonelify.com/">`. A canonical pointing
 * somewhere else tells an engine to fold this URL into the homepage, and the
 * robots.txt disallow does not undo that: a disallowed URL can still be
 * indexed from links, it just gets indexed with nothing read from it.
 */
export const metadata: Metadata = {
    title: "Create your account",
    robots: { index: false, follow: false },
    alternates: { canonical: "/sign-up" },
};

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#08080C]">
            <SignUp
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl={AFTER_SIGN_UP}
            />
        </div>
    );
}
