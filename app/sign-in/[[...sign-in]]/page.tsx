import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

// Clerk v6 ignores the legacy NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL variable, which
// left every sign-in landing back on the marketing page. The destination is set
// on the component instead, and a `redirect_url` in the query still wins.
const AFTER_SIGN_IN = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/tone-match";

/**
 * Its own title and a noindex. The page used to inherit the root layout's
 * metadata, so the sign-in screen was titled like the homepage and pointed its
 * canonical at "/", which asks an engine to fold this URL into the homepage.
 */
export const metadata: Metadata = {
    title: "Sign in",
    robots: { index: false, follow: false },
    alternates: { canonical: "/sign-in" },
};

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#08080C]">
            <SignIn
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl={AFTER_SIGN_IN}
            />
        </div>
    );
}
