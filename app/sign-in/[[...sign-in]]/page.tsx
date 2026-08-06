import { SignIn } from "@clerk/nextjs";

// Clerk v6 ignores the legacy NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL variable, which
// left every sign-in landing back on the marketing page. The destination is set
// on the component instead, and a `redirect_url` in the query still wins.
const AFTER_SIGN_IN = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/tone-match";

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
